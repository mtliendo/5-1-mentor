import { fromApiPreferences, normalizeRoleNames } from "./progress-adapter";
import { persistPreferences, savePreferences, syncPreferencesFromApi } from "./storage";
import type {
  ShareCreateResponse,
  SharedLineup,
  StudyPreferences,
} from "./types";

export type ShareApiKind =
  | "unauthorized"
  | "not_found"
  | "unavailable"
  | "failed";

export type ShareApiError = {
  kind: ShareApiKind;
  message: string;
  status?: number;
};

export type ShareResult<T> = { ok: true; value: T } | { ok: false; error: ShareApiError };

const UNAVAILABLE_MESSAGE =
  "Share isn’t live on this deploy yet. Backend share routes haven’t landed.";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(
  raw: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function pickBoolean(
  raw: Record<string, unknown>,
  keys: string[],
): boolean | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorFromResponse(
  status: number,
  body: unknown,
  fallback: string,
): ShareApiError {
  const message =
    isPlainObject(body) && typeof body.error === "string" && body.error.trim()
      ? body.error
      : fallback;

  if (status === 401) {
    return { kind: "unauthorized", message: "Sign in to share or import a lineup.", status };
  }

  if (status === 403) {
    return { kind: "failed", message: "Only the owner can revoke this share.", status };
  }

  if (status === 404) {
    // HTML 404 usually means the route itself is missing on this deploy.
    if (body == null) {
      return { kind: "unavailable", message: UNAVAILABLE_MESSAGE, status };
    }
    return {
      kind: "not_found",
      message: message || "This lineup share wasn’t found.",
      status,
    };
  }

  if (status === 405 || status === 501) {
    return { kind: "unavailable", message: UNAVAILABLE_MESSAGE, status };
  }

  return { kind: "failed", message, status };
}

function unwrapSharePayload(raw: unknown): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null;
  const nested = raw.share ?? raw.data ?? raw.payload ?? raw.lineup;
  if (isPlainObject(nested)) return { ...raw, ...nested };
  return raw;
}

export function parseSharedLineup(raw: unknown): SharedLineup | null {
  const payload = unwrapSharePayload(raw);
  if (!payload) return null;

  const roleNamesRaw =
    payload.roleNames ?? payload.roles ?? payload.names ?? payload.role_names;
  const liberoEnabled = pickBoolean(payload, [
    "liberoEnabled",
    "liberoOn",
    "libero",
    "libero_enabled",
  ]);

  if (roleNamesRaw === undefined && liberoEnabled === undefined) {
    return null;
  }

  return {
    roleNames: normalizeRoleNames(roleNamesRaw),
    liberoEnabled: liberoEnabled ?? true,
    expiresAt: pickString(payload, ["expiresAt", "expires_at"]),
    createdAt: pickString(payload, ["createdAt", "created_at"]),
  };
}

export function parseCreateShare(raw: unknown): ShareCreateResponse | null {
  const payload = unwrapSharePayload(raw);
  if (!payload) return null;

  const token = pickString(payload, ["token", "shareToken", "id"]);
  if (!token) return null;

  const url = pickString(payload, ["url", "shareUrl", "href", "path"]);
  return {
    token,
    url: url ?? `/share/${token}`,
    expiresAt: pickString(payload, ["expiresAt", "expires_at"]),
  };
}

export function toAbsoluteShareUrl(url: string, token: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") {
    return url.startsWith("/") ? url : `/share/${token}`;
  }
  if (url.startsWith("/")) return `${window.location.origin}${url}`;
  return `${window.location.origin}/share/${token}`;
}

export function sharePath(token: string): string {
  return `/share/${encodeURIComponent(token)}`;
}

async function requestJson(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown } | { error: ShareApiError }> {
  try {
    const response = await fetch(path, {
      cache: "no-store",
      ...init,
    });
    const body = await readBody(response);
    return { status: response.status, body };
  } catch {
    return {
      error: {
        kind: "failed",
        message: "Couldn’t reach the share API. Check your connection and retry.",
      },
    };
  }
}

/**
 * Create a share of the signed-in user’s current names + libero.
 * Prefers an empty body so the server reads stored prefs.
 */
export async function createShare(
  snapshot?: Partial<StudyPreferences>,
): Promise<ShareResult<ShareCreateResponse>> {
  const body =
    snapshot && (snapshot.roleNames || snapshot.liberoEnabled !== undefined)
      ? snapshot
      : {};
  const result = await requestJson("/api/me/shares", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if ("error" in result) return { ok: false, error: result.error };

  if (result.status < 200 || result.status >= 300) {
    return {
      ok: false,
      error: errorFromResponse(
        result.status,
        result.body,
        "Couldn’t create a share link.",
      ),
    };
  }

  const parsed = parseCreateShare(result.body);
  if (!parsed) {
    return {
      ok: false,
      error: {
        kind: "failed",
        message: "Share API returned an unexpected response.",
        status: result.status,
      },
    };
  }
  return { ok: true, value: parsed };
}

export async function fetchShare(
  token: string,
): Promise<ShareResult<SharedLineup>> {
  const result = await requestJson(`/api/shares/${encodeURIComponent(token)}`);
  if ("error" in result) return { ok: false, error: result.error };

  if (result.status === 404) {
    return {
      ok: false,
      error: errorFromResponse(
        404,
        result.body,
        "This lineup share wasn’t found.",
      ),
    };
  }

  if (result.status < 200 || result.status >= 300) {
    return {
      ok: false,
      error: errorFromResponse(
        result.status,
        result.body,
        "Couldn’t load this shared lineup.",
      ),
    };
  }

  const parsed = parseSharedLineup(result.body);
  if (!parsed) {
    return {
      ok: false,
      error: {
        kind: "failed",
        message: "Share API returned an unexpected lineup.",
        status: result.status,
      },
    };
  }
  return { ok: true, value: parsed };
}

export async function importShare(
  token: string,
): Promise<ShareResult<StudyPreferences | null>> {
  const result = await requestJson(
    `/api/me/shares/${encodeURIComponent(token)}/import`,
    { method: "POST" },
  );
  if ("error" in result) return { ok: false, error: result.error };

  if (result.status < 200 || result.status >= 300) {
    return {
      ok: false,
      error: errorFromResponse(
        result.status,
        result.body,
        "Couldn’t import this lineup.",
      ),
    };
  }

  const parsed = parseSharedLineup(result.body);
  if (parsed) {
    const prefs = fromApiPreferences(parsed);
    savePreferences(prefs);
    return { ok: true, value: prefs };
  }

  const synced = await syncPreferencesFromApi();
  return { ok: true, value: synced };
}

export async function revokeShare(token: string): Promise<ShareResult<true>> {
  const result = await requestJson(
    `/api/me/shares/${encodeURIComponent(token)}`,
    { method: "DELETE" },
  );
  if ("error" in result) return { ok: false, error: result.error };

  if (result.status === 404 || result.status === 405 || result.status === 501) {
    return {
      ok: false,
      error: errorFromResponse(
        result.status,
        result.body,
        "Revoke isn’t available on this deploy yet.",
      ),
    };
  }

  if (result.status < 200 || result.status >= 300) {
    return {
      ok: false,
      error: errorFromResponse(
        result.status,
        result.body,
        "Couldn’t revoke this share link.",
      ),
    };
  }

  return { ok: true, value: true };
}

/** Flush on-screen prefs, then mint a share. Server snapshots stored prefs. */
export async function shareCurrentLineup(
  prefs: StudyPreferences,
): Promise<ShareResult<ShareCreateResponse>> {
  await persistPreferences(prefs);
  return createShare();
}
