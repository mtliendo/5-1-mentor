import type { PassingAlternate } from "./types";

export const PASSING_LOOK_HELP: Record<string, string> = {
  "oh-cover-setter":
    "Everyday R1 look. OH1 drops deep to pass with OH2 and L so S can hide right. After the ball is over, OH1 takes left front and Opposite takes right front.",
  "rs-cover":
    "Alternate: RS/Opposite drops back to pass so S can push up closer to the setting spot.",
  "outsides-and-l":
    "Shift the middle, setter, and RS right. L and both outsides take the pass.",
  "s-push-up":
    "S starts middle-back in R3. Push S mid/front toward the net — still behind MB1 — while OH2, OH1, and L pass.",
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
