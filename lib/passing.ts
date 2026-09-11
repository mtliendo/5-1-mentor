import type { PassingAlternate } from "./types";

export const PASSING_LOOK_HELP: Record<string, string> = {
  "3-person":
    "Everyday serve-receive. Three passers share the court so the setter can hide and run a full 5-1.",
  "2-person":
    "Call this when a tough jump-float is hunting one passer or a seam. Two platforms take the ball; everyone else gets out of the way so they don’t clog the pass.",
  "w-pass":
    "Four players make a W against a tough floater or short serve. Extra platforms up the seams so nobody has to chase a mile.",
};

export function passingLookHelp(look: PassingAlternate): string {
  return PASSING_LOOK_HELP[look.id] ?? look.description;
}
