export type PreferencesPatch = {
  liberoEnabled?: boolean;
  roleNames?: Record<string, unknown>;
};

export type ProgressPatch = {
  completed?: Record<string, unknown>;
  lastRotation?: number;
  lastMode?: "serve" | "serve-receive";
  lastAlternate?: string | null;
  lastStep?: number;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseJsonObject(
  raw: unknown,
): { value: Record<string, unknown> } | { error: string } {
  if (!isPlainObject(raw)) {
    return { error: "Body must be a JSON object" };
  }
  return { value: raw };
}

export function parsePreferencesPatch(
  raw: unknown,
): { patch: PreferencesPatch } | { error: string } {
  const parsed = parseJsonObject(raw);
  if ("error" in parsed) return parsed;

  const patch: PreferencesPatch = {};
  const body = parsed.value;

  if ("liberoEnabled" in body) {
    if (typeof body.liberoEnabled !== "boolean") {
      return { error: "liberoEnabled must be a boolean" };
    }
    patch.liberoEnabled = body.liberoEnabled;
  }

  if ("roleNames" in body) {
    if (!isPlainObject(body.roleNames)) {
      return { error: "roleNames must be an object" };
    }
    patch.roleNames = body.roleNames;
  }

  return { patch };
}

export function parseProgressPatch(
  raw: unknown,
): { patch: ProgressPatch } | { error: string } {
  const parsed = parseJsonObject(raw);
  if ("error" in parsed) return parsed;

  const patch: ProgressPatch = {};
  const body = parsed.value;

  if ("completed" in body) {
    if (!isPlainObject(body.completed)) {
      return { error: "completed must be an object" };
    }
    patch.completed = body.completed;
  }

  if ("lastRotation" in body) {
    const value = body.lastRotation;
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 6) {
      return { error: "lastRotation must be an integer from 1 to 6" };
    }
    patch.lastRotation = value;
  }

  if ("lastMode" in body) {
    if (body.lastMode !== "serve" && body.lastMode !== "serve-receive") {
      return { error: "lastMode must be \"serve\" or \"serve-receive\"" };
    }
    patch.lastMode = body.lastMode;
  }

  if ("lastAlternate" in body) {
    if (body.lastAlternate !== null && typeof body.lastAlternate !== "string") {
      return { error: "lastAlternate must be a string or null" };
    }
    patch.lastAlternate = body.lastAlternate;
  }

  if ("lastStep" in body) {
    if (typeof body.lastStep !== "number" || !Number.isInteger(body.lastStep)) {
      return { error: "lastStep must be an integer" };
    }
    patch.lastStep = body.lastStep;
  }

  return { patch };
}

/** Url-safe share tokens are 32+ bytes of entropy (base64url ≈ 43 chars). */
const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

export function parseShareToken(
  value: unknown,
): { token: string } | { error: string } {
  if (typeof value !== "string") {
    return { error: "token must be a string" };
  }
  const token = value.trim();
  if (!SHARE_TOKEN_PATTERN.test(token)) {
    return { error: "Invalid share token" };
  }
  return { token };
}

export function parseFormationSharePayload(
  raw: unknown,
): { payload: { roleNames: Record<string, unknown>; liberoEnabled: boolean } } | { error: string } {
  if (!isPlainObject(raw)) {
    return { error: "payload must be an object" };
  }
  if (typeof raw.liberoEnabled !== "boolean") {
    return { error: "liberoEnabled must be a boolean" };
  }
  if (!isPlainObject(raw.roleNames)) {
    return { error: "roleNames must be an object" };
  }
  return {
    payload: {
      roleNames: raw.roleNames,
      liberoEnabled: raw.liberoEnabled,
    },
  };
}

export async function readJsonBody(
  request: Request,
): Promise<{ value: unknown } | { error: string }> {
  try {
    return { value: await request.json() };
  } catch {
    return { error: "Invalid JSON body" };
  }
}
