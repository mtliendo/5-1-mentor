import type { PassingAlternate } from "./types";

export const PASSING_LOOK_HELP: Record<string, string> = {
  "oh-cover-setter":
    "Everyday R1 look. OH1 drops back to hide and cover S so the setter can run a 5-1. RS swings left on first ball.",
  "rs-cover":
    "RS drops back so S can start closer to the setting spot instead of hiding deep.",
  "outsides-and-l":
    "Shift the middle, setter, and RS right. L and both outsides take the pass.",
  "s-push-up":
    "S is back-left, far from the target. Push S up toward the net — still behind MB1 and left of OH1.",
  "oh2-drop":
    "S and MB1 shade left. RS stays back-right so OH2 can drop back and pass.",
  "oh1-drop":
    "OH1 drops back to pass. L covers RS so the opposite does not take the serve.",
  "l-in-middle":
    "L is back in for the middle. Front pins stay ready to hit; back-row OH can pipe.",
  "rs-pass":
    "Let the opposite pass — usually so a front-row outside can stay on the pin.",
  "2-person":
    "Call this when a tough jump-float is hunting one passer or a seam. Two platforms take the ball; everyone else gets out of the way so they don’t clog the pass.",
  "w-pass":
    "Four players make a W against a tough floater or short serve. Extra platforms up the seams so nobody has to chase a mile.",
};

export function passingLookHelp(look: PassingAlternate): string {
  return PASSING_LOOK_HELP[look.id] ?? look.description;
}
