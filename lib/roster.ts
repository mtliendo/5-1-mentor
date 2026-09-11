import type { PlayerId, Role, RosterPlayer } from "./types";

export const ROSTER: RosterPlayer[] = [
  { id: "S", name: "Avery", defaultRole: "Setter" },
  { id: "OPP", name: "Jules", defaultRole: "Opposite" },
  { id: "OH1", name: "Kai", defaultRole: "Outside" },
  { id: "OH2", name: "Remy", defaultRole: "Outside" },
  { id: "MB1", name: "Nolan", defaultRole: "Middle" },
  { id: "MB2", name: "Sage", defaultRole: "Middle" },
  { id: "L", name: "Priya", defaultRole: "Libero" },
];

const BY_ID = Object.fromEntries(ROSTER.map((player) => [player.id, player])) as Record<
  PlayerId,
  RosterPlayer
>;

export function getRosterPlayer(id: PlayerId): RosterPlayer {
  return BY_ID[id];
}

export function chipLabel(name: string | null | undefined, role: Role): string {
  return `${name ?? role} · ${role}`;
}

export function applyRoleNames<T extends { id: PlayerId; name: string; role: Role }>(
  players: T[],
  roleNames: Record<string, string>,
): T[] {
  return players.map((player) => {
    const override = roleNames[player.id] ?? roleNames[player.role];
    return {
      ...player,
      name: override || player.name,
    };
  });
}
