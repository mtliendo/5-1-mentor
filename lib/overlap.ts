import type { CourtPos, ResolvedPlayer } from "./types";

export interface OverlapPair {
  a: CourtPos;
  b: CourtPos;
  axis: "x" | "y";
  legal: boolean;
}

function atPos(players: ResolvedPlayer[], pos: CourtPos) {
  return players.find((player) => player.courtPos === pos);
}

/**
 * At serve contact, neighbors cannot overlap:
 * 4 left of 3 left of 2; 5 left of 6 left of 1;
 * each front-row player closer to the net than their back-row pair.
 */
export function evaluateOverlaps(players: ResolvedPlayer[]): OverlapPair[] {
  const pairs: Array<{ a: CourtPos; b: CourtPos; axis: "x" | "y" }> = [
    { a: 4, b: 3, axis: "x" },
    { a: 3, b: 2, axis: "x" },
    { a: 5, b: 6, axis: "x" },
    { a: 6, b: 1, axis: "x" },
    { a: 4, b: 5, axis: "y" },
    { a: 3, b: 6, axis: "y" },
    { a: 2, b: 1, axis: "y" },
  ];

  return pairs.map((pair) => {
    const leftOrFront = atPos(players, pair.a);
    const rightOrBack = atPos(players, pair.b);
    if (!leftOrFront || !rightOrBack) {
      return { ...pair, legal: true };
    }
    const legal =
      pair.axis === "x"
        ? leftOrFront.x < rightOrBack.x
        : leftOrFront.y < rightOrBack.y;
    return { ...pair, legal };
  });
}

export const ZONE_ANCHORS: Record<CourtPos, { x: number; y: number }> = {
  1: { x: 0.82, y: 0.78 },
  2: { x: 0.82, y: 0.22 },
  3: { x: 0.5, y: 0.2 },
  4: { x: 0.18, y: 0.22 },
  5: { x: 0.18, y: 0.78 },
  6: { x: 0.5, y: 0.8 },
};
