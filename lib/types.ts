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

export interface StudyProgress {
  guidedLessonId: string;
  completedLessons: string[];
  quizBest: number;
  lastRotation: RotationId;
  lastMode: PlayMode;
}

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
