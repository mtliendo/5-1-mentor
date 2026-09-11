import {
  DEFAULT_PREFERENCES,
  DEFAULT_PROGRESS,
  fromApiPreferences,
  fromApiProgress,
  normalizeProgress,
  toApiPreferences,
  toApiProgress,
} from "./progress-adapter";
import type { ApiPreferences, ApiProgress, StudyPreferences, StudyProgress } from "./types";

export { DEFAULT_PREFERENCES, DEFAULT_PROGRESS };

export const STORAGE_PREFIX = "five-one-mentor";

const PROGRESS_KEY = `${STORAGE_PREFIX}:progress`;
const PREFERENCES_KEY = `${STORAGE_PREFIX}:preferences`;

export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota — ignore for the MVP.
  }
}

export function loadProgress(): StudyProgress {
  return normalizeProgress(loadLocal(PROGRESS_KEY, DEFAULT_PROGRESS));
}

export function saveProgress(progress: StudyProgress): void {
  saveLocal(PROGRESS_KEY, progress);
}

export function loadPreferences(): StudyPreferences {
  return fromApiPreferences(loadLocal(PREFERENCES_KEY, DEFAULT_PREFERENCES));
}

export function savePreferences(prefs: StudyPreferences): void {
  saveLocal(PREFERENCES_KEY, prefs);
}

async function getMe<T>(path: string): Promise<T | "guest" | "error"> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (response.status === 401) return "guest";
    if (!response.ok) return "error";
    return (await response.json()) as T;
  } catch {
    return "error";
  }
}

async function putMe(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Authenticated → GET /api/me/progress.
 * Guest / unconfigured Auth0 or Neon → localStorage.
 * Legacy POST /api/progress is not used.
 */
export async function syncProgressFromApi(): Promise<StudyProgress> {
  const local = loadProgress();
  const remote = await getMe<ApiProgress>("/api/me/progress");
  if (remote === "guest" || remote === "error") {
    return local;
  }
  const merged = fromApiProgress(remote, local);
  saveProgress(merged);
  return merged;
}

export async function persistProgress(
  patch: Partial<StudyProgress>,
): Promise<StudyProgress> {
  const next = normalizeProgress({ ...loadProgress(), ...patch });
  saveProgress(next);
  await putMe("/api/me/progress", toApiProgress(next));
  return next;
}

export async function syncPreferencesFromApi(): Promise<StudyPreferences> {
  const local = loadPreferences();
  const remote = await getMe<ApiPreferences>("/api/me/preferences");
  if (remote === "guest" || remote === "error") {
    return local;
  }
  const merged = fromApiPreferences(remote, local);
  savePreferences(merged);
  return merged;
}

export async function persistPreferences(
  patch: Partial<StudyPreferences>,
): Promise<StudyPreferences> {
  const current = loadPreferences();
  const next: StudyPreferences = {
    liberoEnabled: patch.liberoEnabled ?? current.liberoEnabled,
    roleNames: patch.roleNames ?? current.roleNames,
  };
  savePreferences(next);
  await putMe("/api/me/preferences", toApiPreferences(next));
  return next;
}
