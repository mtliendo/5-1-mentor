import type {
  ApiPreferences,
  ApiProgress,
  PlayMode,
  RotationId,
  StudyPreferences,
  StudyProgress,
} from "./types";

export const DEFAULT_PROGRESS: StudyProgress = {
  guidedLessonId: "intro",
  completedLessons: [],
  quizBest: 0,
  lastRotation: 1,
  lastMode: "serve-receive",
  lastAlternate: null,
  lastStep: 0,
};

export const DEFAULT_PREFERENCES: StudyPreferences = {
  liberoEnabled: true,
  roleNames: {},
};

function isPlayMode(value: unknown): value is PlayMode {
  return value === "serve" || value === "serve-receive";
}

function asRotationId(value: unknown, fallback: RotationId): RotationId {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 6
  ) {
    return value as RotationId;
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeRoleNames(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const names: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      names[key] = value;
    }
  }
  return names;
}

/**
 * Pack UI `StudyProgress` into the /api/me/progress body.
 * Lesson + quiz fields live under `completed` so the API object stays free-form.
 */
export function toApiProgress(progress: StudyProgress): ApiProgress {
  return {
    completed: {
      guidedLessonId: progress.guidedLessonId,
      completedLessons: progress.completedLessons,
      quizBest: progress.quizBest,
    },
    lastRotation: progress.lastRotation,
    lastMode: progress.lastMode,
    lastAlternate: progress.lastAlternate,
    lastStep: progress.lastStep,
  };
}

/** Unpack an /api/me/progress body into UI state without dropping local fields. */
export function fromApiProgress(
  api: Partial<ApiProgress> | null | undefined,
  fallback: StudyProgress = DEFAULT_PROGRESS,
): StudyProgress {
  const completed = api?.completed ?? {};
  const guidedLessonId =
    typeof completed.guidedLessonId === "string"
      ? completed.guidedLessonId
      : fallback.guidedLessonId;
  const completedLessons =
    asStringArray(completed.completedLessons).length > 0
      ? asStringArray(completed.completedLessons)
      : fallback.completedLessons;
  const quizBest =
    typeof completed.quizBest === "number" && Number.isFinite(completed.quizBest)
      ? completed.quizBest
      : fallback.quizBest;

  return {
    guidedLessonId,
    completedLessons,
    quizBest,
    lastRotation: asRotationId(api?.lastRotation, fallback.lastRotation),
    lastMode: isPlayMode(api?.lastMode) ? api.lastMode : fallback.lastMode,
    lastAlternate:
      api?.lastAlternate === null || typeof api?.lastAlternate === "string"
        ? (api.lastAlternate ?? null)
        : fallback.lastAlternate,
    lastStep:
      typeof api?.lastStep === "number" && Number.isInteger(api.lastStep)
        ? api.lastStep
        : fallback.lastStep,
  };
}

export function fromApiPreferences(
  api: Partial<ApiPreferences> | null | undefined,
  fallback: StudyPreferences = DEFAULT_PREFERENCES,
): StudyPreferences {
  return {
    liberoEnabled:
      typeof api?.liberoEnabled === "boolean"
        ? api.liberoEnabled
        : fallback.liberoEnabled,
    roleNames:
      api?.roleNames !== undefined
        ? normalizeRoleNames(api.roleNames)
        : fallback.roleNames,
  };
}

export function toApiPreferences(prefs: StudyPreferences): ApiPreferences {
  return {
    liberoEnabled: prefs.liberoEnabled,
    roleNames: prefs.roleNames,
  };
}

/** Validate a locally stored StudyProgress blob (may be a pre-adapter shape). */
export function normalizeProgress(raw: Partial<StudyProgress> | null | undefined): StudyProgress {
  return fromApiProgress(
    {
      completed: {
        guidedLessonId: raw?.guidedLessonId,
        completedLessons: raw?.completedLessons,
        quizBest: raw?.quizBest,
      },
      lastRotation: raw?.lastRotation,
      lastMode: raw?.lastMode,
      lastAlternate: raw?.lastAlternate ?? null,
      lastStep: raw?.lastStep ?? 0,
    },
    DEFAULT_PROGRESS,
  );
}
