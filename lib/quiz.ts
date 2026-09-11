import type { QuizQuestion } from "./types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "In Rotation 1, which court position is the setter occupying?",
    choices: [
      { id: "a", label: "Position 1 — right back" },
      { id: "b", label: "Position 2 — right front" },
      { id: "c", label: "Position 4 — left front" },
      { id: "d", label: "Position 6 — middle back" },
    ],
    correctId: "a",
  },
  {
    id: "q2",
    prompt: "A 5-1 uses how many setters on the court?",
    choices: [
      { id: "a", label: "Two, they alternate sets" },
      { id: "b", label: "One setter for every rotation" },
      { id: "c", label: "None — the libero sets" },
      { id: "d", label: "Three, one per front-row slot" },
    ],
    correctId: "b",
  },
  {
    id: "q3",
    prompt: "When the setter is in the back row, how many front-row attackers are available?",
    choices: [
      { id: "a", label: "One" },
      { id: "b", label: "Two" },
      { id: "c", label: "Three" },
      { id: "d", label: "Four" },
    ],
    correctId: "c",
  },
  {
    id: "q4",
    prompt: "In this app, what happens when the libero toggle is off?",
    choices: [
      { id: "a", label: "The court shows five players" },
      { id: "b", label: "L is mapped to back-row middle" },
      { id: "c", label: "The setter is removed" },
      { id: "d", label: "Everyone stacks on position 6" },
    ],
    correctId: "b",
  },
  {
    id: "q5",
    prompt: "At the moment of serve, can position 4 stand to the right of position 3?",
    choices: [
      { id: "a", label: "Yes, if they are attacking" },
      { id: "b", label: "Yes, only in serve-receive" },
      { id: "c", label: "No — that is a left/right overlap" },
      { id: "d", label: "Only when the libero is on" },
    ],
    correctId: "c",
  },
  {
    id: "q6",
    prompt: "Which mode uses the named passing alternates (3-person, 2-person, W-pass)?",
    choices: [
      { id: "a", label: "Serve only" },
      { id: "b", label: "Serve-receive" },
      { id: "c", label: "Quiz mode" },
      { id: "d", label: "Timeout walkthroughs" },
    ],
    correctId: "b",
  },
];
