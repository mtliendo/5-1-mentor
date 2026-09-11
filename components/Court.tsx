import { OverlapOverlay } from "./OverlapOverlay";
import { PlayerChip } from "./PlayerChip";
import type { ResolvedPlayer } from "@/lib/types";

export function Court({
  players,
  overlay,
  reducedMotion,
}: {
  players: ResolvedPlayer[];
  overlay: boolean;
  reducedMotion: boolean;
}) {
  return (
    <section
      aria-label="Half court, net at the top"
      className="overflow-hidden rounded-[28px] border border-court-deep/40 bg-court-deep shadow-[0_18px_40px_rgba(20,35,28,0.18)]"
    >
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-line/80">
        <span>Net</span>
        <span>Our half</span>
      </div>
      <div className="relative mx-3 mb-3 aspect-square rounded-[22px] bg-court">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            fill="none"
            stroke="#efe8d2"
            strokeWidth="1.6"
          />
          <line
            x1="3"
            y1="34"
            x2="97"
            y2="34"
            stroke="#efe8d2"
            strokeWidth="1.2"
          />
          <rect x="3" y="3" width="94" height="4.5" fill="#1c4633" />
          <line
            x1="3"
            y1="5.2"
            x2="97"
            y2="5.2"
            stroke="#fffaf2"
            strokeWidth="1.4"
          />
          <circle cx="8" cy="5.2" r="1.3" fill="#e85d04" />
          <circle cx="92" cy="5.2" r="1.3" fill="#e85d04" />
          <text
            x="50"
            y="31"
            textAnchor="middle"
            fill="#efe8d2"
            fontSize="3.4"
            letterSpacing="0.4"
            opacity="0.7"
          >
            ATTACK LINE
          </text>
        </svg>

        {overlay ? <OverlapOverlay players={players} /> : null}

        {players.map((player) => (
          <PlayerChip
            key={player.id}
            player={player}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
