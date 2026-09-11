import type { RotationContent } from "@/lib/types";
import r1 from "./r1.json";
import r2 from "./r2.json";
import r3 from "./r3.json";
import r4 from "./r4.json";
import r5 from "./r5.json";
import r6 from "./r6.json";

export const rotations: RotationContent[] = [
  r1 as RotationContent,
  r2 as RotationContent,
  r3 as RotationContent,
  r4 as RotationContent,
  r5 as RotationContent,
  r6 as RotationContent,
];

export function loadRotations(): RotationContent[] {
  return rotations;
}
