import { chipLabel } from "@/lib/roster";
import type { ResolvedPlayer, Role } from "@/lib/types";

const ROLE_DOT: Record<Role, string> = {
  Setter: "bg-accent",
  Opposite: "bg-amber-400",
  Outside: "bg-sky-400",
  Middle: "bg-line",
  Libero: "bg-libero",
  "Back-row Middle": "bg-emerald-700",
};

export function PlayerChip({
  player,
  reducedMotion,
}: {
  player: ResolvedPlayer;
  reducedMotion: boolean;
}) {
  return (
    <div
      className={`player-chip absolute z-10 max-w-[48%] ${reducedMotion ? "[transition:none]" : ""}`}
      style={{ left: `${player.x * 100}%`, top: `${player.y * 100}%` }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-on-panel/15 bg-chip px-2.5 py-1 shadow-[0_10px_20px_rgba(0,0,0,0.28)]">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-extrabold leading-none text-on-panel">
          <span
            aria-hidden
            className={`inline-block size-2.5 shrink-0 rounded-full ${ROLE_DOT[player.role]}`}
          />
          <span>{chipLabel(player.name, player.role)}</span>
        </p>
      </div>
    </div>
  );
}
