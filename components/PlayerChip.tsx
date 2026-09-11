import { chipLabel } from "@/lib/roster";
import type { ResolvedPlayer, Role } from "@/lib/types";

const ROLE_DOT: Record<Role, string> = {
  Setter: "bg-accent",
  Opposite: "bg-amber-400",
  Outside: "bg-sky-500",
  Middle: "bg-court",
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
      className={`player-chip absolute z-10 max-w-[46%] ${reducedMotion ? "[transition:none]" : ""}`}
      style={{ left: `${player.x * 100}%`, top: `${player.y * 100}%` }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10 bg-chip px-2.5 py-1 shadow-[0_8px_18px_rgba(20,35,28,0.18)]">
        <p className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-semibold leading-none text-ink">
          <span
            aria-hidden
            className={`inline-block size-2 shrink-0 rounded-full ${ROLE_DOT[player.role]}`}
          />
          <span>{chipLabel(player.name, player.role)}</span>
        </p>
      </div>
    </div>
  );
}
