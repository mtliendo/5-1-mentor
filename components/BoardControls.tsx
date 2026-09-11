import type { ReactNode } from "react";
import { ROSTER } from "@/lib/roster";
import { ROTATION_IDS } from "@/lib/rotations";
import type { PassingAlternate, PlayerId, PlayMode, RotationId } from "@/lib/types";

function SegButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-2xl px-3 text-sm font-semibold ${
        active
          ? "bg-ink text-paper"
          : "bg-paper text-ink-soft hover:bg-paper-deep hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function BoardControls({
  rotation,
  mode,
  passingId,
  passingAlternates,
  liberoOn,
  overlay,
  playing,
  stepLabel,
  stepIndex,
  stepCount,
  onRotation,
  onMode,
  onPassing,
  onLibero,
  onOverlay,
  onPrev,
  onNext,
  onPlayAll,
  onReset,
  roleNames,
  onRoleName,
}: {
  rotation: RotationId;
  mode: PlayMode;
  passingId: string;
  passingAlternates: PassingAlternate[];
  liberoOn: boolean;
  overlay: boolean;
  playing: boolean;
  stepLabel: string;
  stepIndex: number;
  stepCount: number;
  onRotation: (id: RotationId) => void;
  onMode: (mode: PlayMode) => void;
  onPassing: (id: string) => void;
  onLibero: (on: boolean) => void;
  onOverlay: (on: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onPlayAll: () => void;
  onReset: () => void;
  roleNames: Record<string, string>;
  onRoleName: (id: PlayerId, name: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-[28px] bg-white/70 p-3 shadow-[0_10px_30px_rgba(20,35,28,0.06)]">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Rotation
        </p>
        <div className="grid grid-cols-6 gap-1">
          {ROTATION_IDS.map((id) => (
            <SegButton
              key={id}
              active={rotation === id}
              onClick={() => onRotation(id)}
            >
              {id}
            </SegButton>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Mode
        </p>
        <div className="grid grid-cols-2 gap-1">
          <SegButton active={mode === "serve"} onClick={() => onMode("serve")}>
            Serve
          </SegButton>
          <SegButton
            active={mode === "serve-receive"}
            onClick={() => onMode("serve-receive")}
          >
            Serve-receive
          </SegButton>
        </div>
      </div>

      {mode === "serve-receive" ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Passing look
          </p>
          <div className="grid grid-cols-3 gap-1">
            {passingAlternates.map((look) => (
              <SegButton
                key={look.id}
                active={passingId === look.id}
                onClick={() => onPassing(look.id)}
              >
                {look.name}
              </SegButton>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-1">
        <SegButton active={liberoOn} onClick={() => onLibero(!liberoOn)}>
          Libero {liberoOn ? "on" : "off"}
        </SegButton>
        <SegButton active={overlay} onClick={() => onOverlay(!overlay)}>
          Overlap {overlay ? "on" : "off"}
        </SegButton>
      </div>

      <details className="rounded-2xl bg-paper px-3 py-1">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-ink">
          Player names
        </summary>
        <ul className="mt-1 space-y-2 pb-2">
          {ROSTER.map((player) => (
            <li key={player.id} className="flex items-center gap-2">
              <label
                className="w-10 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-soft"
                htmlFor={`role-name-${player.id}`}
              >
                {player.id}
              </label>
              <input
                id={`role-name-${player.id}`}
                value={roleNames[player.id] ?? player.name}
                placeholder={player.defaultRole}
                onChange={(event) => onRoleName(player.id, event.target.value)}
                className="min-h-11 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink"
              />
            </li>
          ))}
        </ul>
      </details>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Step {stepIndex + 1}/{stepCount} · {stepLabel}
        </p>
        <div className="grid grid-cols-4 gap-1">
          <SegButton active={false} onClick={onReset}>
            Reset
          </SegButton>
          <SegButton active={false} onClick={onPrev}>
            Back
          </SegButton>
          <SegButton active={playing} onClick={onPlayAll}>
            {playing ? "Pause" : "Play all"}
          </SegButton>
          <SegButton active={false} onClick={onNext}>
            Step
          </SegButton>
        </div>
      </div>
    </div>
  );
}
