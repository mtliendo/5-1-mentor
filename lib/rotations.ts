import type {
  PassingAlternate,
  PlayMode,
  PlayStep,
  RotationContent,
  RotationId,
} from "./types";

export function getRotation(
  rotations: RotationContent[],
  id: RotationId,
): RotationContent {
  const match = rotations.find((item) => item.rotation === id);
  if (!match) {
    throw new Error(`Missing rotation ${id}`);
  }
  return match;
}

export function listPassingAlternates(
  rotation: RotationContent,
): PassingAlternate[] {
  return rotation.modes["serve-receive"].passingAlternates;
}

export function defaultPassingId(rotation: RotationContent): string {
  return listPassingAlternates(rotation)[0]?.id ?? "oh-cover-setter";
}

export function getActiveSteps(
  rotation: RotationContent,
  mode: PlayMode,
  passingId: string,
): PlayStep[] {
  if (mode === "serve") {
    return rotation.modes.serve.steps;
  }
  const alternates = listPassingAlternates(rotation);
  const selected =
    alternates.find((item) => item.id === passingId) ?? alternates[0];
  return selected?.steps ?? [];
}

export const ROTATION_IDS: RotationId[] = [1, 2, 3, 4, 5, 6];
