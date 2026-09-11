import { getRosterPlayer } from "./roster";
import type {
  PlayerId,
  PlayStep,
  ResolvedPlayer,
  RotationContent,
} from "./types";

/**
 * Libero-off maps L onto the back-row middle slot:
 * Priya stays on the court, inherits the hidden MB's coordinates,
 * and is labeled "Back-row Middle".
 */
export function resolveStepPlayers(
  rotation: RotationContent,
  step: PlayStep,
  liberoOn: boolean,
): ResolvedPlayer[] {
  const backId = rotation.backRowMiddleId;
  const backPlacement = step.positions[backId];
  const resolved: ResolvedPlayer[] = [];

  (Object.keys(step.positions) as PlayerId[]).forEach((id) => {
    if (id === backId) return;

    const placement = step.positions[id];
    if (!placement) return;

    const roster = getRosterPlayer(id);

    if (id === "L" && !liberoOn) {
      resolved.push({
        id,
        name: roster.name,
        role: "Back-row Middle",
        x: backPlacement?.x ?? placement.x,
        y: backPlacement?.y ?? placement.y,
        courtPos: backPlacement?.courtPos ?? placement.courtPos,
      });
      return;
    }

    resolved.push({
      id,
      name: roster.name,
      role: placement.role,
      x: placement.x,
      y: placement.y,
      courtPos: placement.courtPos,
    });
  });

  return resolved.sort((a, b) => a.courtPos - b.courtPos);
}
