import type { StudyProgress } from "./types";

export const STORAGE_PREFIX = "five-one-mentor";

const PROGRESS_KEY = `${STORAGE_PREFIX}:progress`;

export const DEFAULT_PROGRESS: StudyProgress = {
  guidedLessonId: "intro",
  completedLessons: [],
  quizBest: 0,
  lastRotation: 1,
  lastMode: "serve-receive",
};

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
  return loadLocal(PROGRESS_KEY, DEFAULT_PROGRESS);
}

export function saveProgress(progress: StudyProgress): void {
  saveLocal(PROGRESS_KEY, progress);
}

/** Try the Neon-backed hook, then fall back to localStorage. */
export async function syncProgressFromApi(): Promise<StudyProgress> {
  try {
    const response = await fetch("/api/progress", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { progress?: StudyProgress | null };
      if (data.progress) {
        saveProgress(data.progress);
        return data.progress;
      }
    }
  } catch {
    // Unconfigured Auth0/Neon — stay local.
  }
  return loadProgress();
}

export async function persistProgress(progress: StudyProgress): Promise<void> {
  saveProgress(progress);
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress),
    });
  } catch {
    // localStorage already written
  }
}
