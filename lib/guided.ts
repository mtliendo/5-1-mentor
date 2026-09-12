import type { PlayMode, RotationId } from "./types";

export interface GuidedLesson {
  id: string;
  title: string;
  body: string;
  rotation: RotationId;
  mode: PlayMode;
  passingId?: string;
  liberoOn: boolean;
  overlay: boolean;
  stepIndex?: number;
}

export const GUIDED_LESSONS: GuidedLesson[] = [
  {
    id: "intro",
    title: "What a 5-1 is",
    body: "One setter takes every second ball. The other five are attackers. We always look at our half of the court, net at the top.",
    rotation: 1,
    mode: "serve-receive",
    passingId: "oh-cover-setter",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "r1-serve",
    title: "Rotation 1 — serve",
    body: "Setter starts in P1 (right back) and serves. Front stacks near mid-net (MB2 closest to the tape; RS and OH1 tucked), then releases to base after the toss.",
    rotation: 1,
    mode: "serve",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "r1-receive",
    title: "Rotation 1 — serve-receive",
    body: "OH cover setter is the everyday look. OH1 drops back to hide S; passers include OH1. RS swings left on first ball.",
    rotation: 1,
    mode: "serve-receive",
    passingId: "oh-cover-setter",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "passing-alts",
    title: "Named passing looks",
    body: "Switch OH cover S, RS cover, 2-person, and W-pass. Same rotation, different platforms. RS cover tucks S closer to the setting spot.",
    rotation: 1,
    mode: "serve-receive",
    passingId: "rs-cover",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "libero-swap",
    title: "Libero on / off",
    body: "Toggle the libero. Off maps Priya onto the back-row middle — same body, new role label.",
    rotation: 2,
    mode: "serve-receive",
    passingId: "outsides-and-l",
    liberoOn: false,
    overlay: false,
  },
  {
    id: "overlap",
    title: "Overlap overlay",
    body: "Neighbors cannot pass each other at serve contact. The overlay draws those legal lanes. Stack and toss should stay green; release/base is after the ball is over.",
    rotation: 4,
    mode: "serve",
    liberoOn: true,
    overlay: true,
  },
  {
    id: "setter-front",
    title: "Setter in front (R4)",
    body: "When the setter is in the front row you only have two front-row attackers. Watch OH2 and MB1 after the stack; primary receive is OH2 drop.",
    rotation: 4,
    mode: "serve-receive",
    passingId: "oh2-drop",
    liberoOn: true,
    overlay: false,
  },
];
