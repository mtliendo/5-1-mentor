import { evaluateOverlaps, ZONE_ANCHORS } from "@/lib/overlap";
import type { CourtPos, ResolvedPlayer } from "@/lib/types";

function pct(n: number) {
  return `${n * 100}%`;
}

export function OverlapOverlay({ players }: { players: ResolvedPlayer[] }) {
  const pairs = evaluateOverlaps(players);
  const posOf = (pos: CourtPos) =>
    players.find((player) => player.courtPos === pos) ?? {
      x: ZONE_ANCHORS[pos].x,
      y: ZONE_ANCHORS[pos].y,
    };

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
      {([1, 2, 3, 4, 5, 6] as CourtPos[]).map((pos) => {
        const zone = ZONE_ANCHORS[pos];
        return (
          <div
            key={pos}
            className="absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line/40 text-[11px] font-bold text-line/70"
            style={{ left: pct(zone.x), top: pct(zone.y) }}
          >
            {pos}
          </div>
        );
      })}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {pairs.map((pair) => {
          const a = posOf(pair.a);
          const b = posOf(pair.b);
          return (
            <line
              key={`${pair.a}-${pair.b}`}
              x1={a.x * 100}
              y1={a.y * 100}
              x2={b.x * 100}
              y2={b.y * 100}
              stroke={pair.legal ? "rgba(239,232,210,0.55)" : "#ffba08"}
              strokeWidth={pair.legal ? 1.1 : 2}
              strokeDasharray={pair.legal ? "3 3" : "0"}
            />
          );
        })}
      </svg>
    </div>
  );
}
