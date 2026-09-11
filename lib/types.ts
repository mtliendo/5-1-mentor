export type RotationId = 1 | 2 | 3 | 4 | 5 | 6;

export type PlayMode = "serve" | "serve-receive";

export type Role =
  | "Setter"
  | "Opposite"
  | "Outside"
  | "Middle"
  | "Libero"
  | "Back-row Middle";

export type PlayerId = "S" | "OPP" | "OH1" | "OH2" | "MB1" | "MB2" | "L";

export type CourtPos = 1 | 2 | 3 | 4 | 5 | 6;

export interface PlayerPlacement {
  x: number;
  y: number;
  role: Role;
  courtPos: CourtPos;
}

export interface PlayStep {
  id: string;
  label: string;
  cue: string;
  positions: Partial<Record<PlayerId, PlayerPlacement>>;
}

export interface PassingAlternate {
  id: string;
  name: string;
  description: string;
  steps: PlayStep[];
}

export interface ServeModeContent {
  steps: PlayStep[];
}

export interface ServeReceiveModeContent {
  passingAlternates: PassingAlternate[];
}

export interface RotationContent {
  id: string;
  rotation: RotationId;
  title: string;
  summary: string;
  notes: string;
  lineup: Record<`${CourtPos}`, PlayerId>;
  backRowMiddleId: "MB1" | "MB2";
  modes: {
    serve: ServeModeContent;
    "serve-receive": ServeReceiveModeContent;
  };
}

export interface RosterPlayer {
  id: PlayerId;
  name: string;
  defaultRole: Role;
}

export interface ResolvedPlayer {
  id: PlayerId;
  name: string;
  role: Role;
  x: number;
  y: number;
  courtPos: CourtPos;
}

/** Client UI progress. Mapped to/from GET/PUT /api/me/progress via a thin adapter. */
export interface StudyProgress {
  guidedLessonId: string;
  completedLessons: string[];
  quizBest: number;
  lastRotation: RotationId;
  lastMode: PlayMode;
  lastAlternate: string | null;
  lastStep: number;
}

/** Client UI preferences. Matches GET/PUT /api/me/preferences. */
export interface StudyPreferences {
  liberoEnabled: boolean;
  roleNames: Record<string, string>;
}

/** Wire shape for GET/PUT /api/me/progress. */
export interface ApiProgress {
  completed: Record<string, unknown>;
  lastRotation: number;
  lastMode: PlayMode;
  lastAlternate: string | null;
  lastStep: number;
}

/** Wire shape for GET/PUT /api/me/preferences. */
export interface ApiPreferences {
  liberoEnabled: boolean;
  roleNames: Record<string, unknown>;
}

/** Locked FE shape for POST /api/me/shares. `expiresAt` is an optional extra. */
export interface ApiShareCreate {
  token: string;
  url: string;
  expiresAt?: string;
}

/** Locked FE shape for GET /api/shares/{token} — no owner PII. */
export interface ApiSharePreview {
  roleNames: Record<string, unknown>;
  liberoEnabled: boolean;
  expiresAt?: string;
}

/** UI-normalized share preview. Names + libero only. */
export interface SharedLineup {
  roleNames: Record<string, string>;
  liberoEnabled: boolean;
  expiresAt?: string;
}

export type ShareCreateResponse = ApiShareCreate;

export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  hint?: string;
  choices: QuizChoice[];
  correctId: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  source: "auth0" | "local";
}
