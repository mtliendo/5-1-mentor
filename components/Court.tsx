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
      className="mx-auto w-full max-w-[36rem] overflow-hidden rounded-[28px] border-2 border-line/70 bg-court-deep shadow-[0_22px_50px_rgba(0,0,0,0.4)] lg:max-w-[min(32rem,calc(100vh-12rem))]"
    >
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-line">
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
            stroke="#e8ff57"
            strokeWidth="1.8"
          />
          <line
            x1="3"
            y1="34"
            x2="97"
            y2="34"
            stroke="#e8ff57"
            strokeWidth="1.4"
          />
          <rect x="3" y="3" width="94" height="5" fill="#03301c" />
          <line
            x1="3"
            y1="5.2"
            x2="97"
            y2="5.2"
            stroke="#fffdf4"
            strokeWidth="1.8"
          />
          <circle cx="8" cy="5.2" r="1.5" fill="#ff3b00" />
          <circle cx="92" cy="5.2" r="1.5" fill="#ff3b00" />
          <text
            x="50"
            y="31"
            textAnchor="middle"
            fill="#e8ff57"
            fontSize="3.6"
            fontWeight="700"
            letterSpacing="0.5"
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
