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
    passingId: "3-person",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "r1-serve",
    title: "Rotation 1 — serve",
    body: "Setter starts in position 1 (right back). Hold legal spacing until the ball is contacted, then release into attack.",
    rotation: 1,
    mode: "serve",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "r1-receive",
    title: "Rotation 1 — serve-receive",
    body: "Three-passer serve-receive is the default. Setter hides on the right so the pass can run a 5-1 set.",
    rotation: 1,
    mode: "serve-receive",
    passingId: "3-person",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "passing-alts",
    title: "Named passing looks",
    body: "Switch 3-person, 2-person, and W-pass. Same rotation, different platforms. Use this when a serve targets a seam.",
    rotation: 1,
    mode: "serve-receive",
    passingId: "2-person",
    liberoOn: true,
    overlay: false,
  },
  {
    id: "libero-swap",
    title: "Libero on / off",
    body: "Toggle the libero. Off maps Priya onto the back-row middle — same body, new role label.",
    rotation: 2,
    mode: "serve-receive",
    passingId: "3-person",
    liberoOn: false,
    overlay: false,
  },
  {
    id: "overlap",
    title: "Overlap overlay",
    body: "Neighbors cannot pass each other at serve contact. The overlay draws those legal lanes. Red means a stub coord still needs a coach pass.",
    rotation: 4,
    mode: "serve",
    liberoOn: true,
    overlay: true,
  },
  {
    id: "setter-front",
    title: "Setter in front (R4)",
    body: "When the setter is in the front row you only have two front-row attackers. Watch the opposite and the available outside.",
    rotation: 4,
    mode: "serve-receive",
    passingId: "3-person",
    liberoOn: true,
    overlay: false,
  },
];
