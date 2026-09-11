import type { ReactNode } from "react";
import { ShareLineup } from "./ShareLineup";
import { passingLookHelp } from "@/lib/passing";
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
      className={`min-h-11 rounded-2xl px-3 text-sm font-extrabold ${
        active
          ? "bg-accent text-white shadow-[0_6px_16px_rgba(255,59,0,0.35)]"
          : "bg-on-panel/10 text-on-panel hover:bg-on-panel/15"
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
  const selectedLook =
    passingAlternates.find((look) => look.id === passingId) ??
    passingAlternates[0];

  return (
    <div className="space-y-3 rounded-[28px] bg-panel p-3 text-on-panel shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
      <div className="space-y-3 lg:sticky lg:top-0 lg:z-10 lg:bg-panel lg:pb-1">
      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
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
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
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
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
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
          {selectedLook ? (
            <p className="mt-2 rounded-2xl border-2 border-accent/25 bg-white px-3 py-2 text-sm leading-relaxed text-on-panel">
              <span className="font-extrabold text-accent">
                Why {selectedLook.name}?
              </span>{" "}
              {passingLookHelp(selectedLook)}
            </p>
          ) : null}
        </div>
      ) : null}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <SegButton active={liberoOn} onClick={() => onLibero(!liberoOn)}>
          Libero {liberoOn ? "on" : "off"}
        </SegButton>
        <SegButton active={overlay} onClick={() => onOverlay(!overlay)}>
          Overlap {overlay ? "on" : "off"}
        </SegButton>
      </div>

      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
          Name your lineup
        </p>
        <p className="mt-1 text-sm text-on-panel-soft">
          Type your gym’s names. Chips always read Name · Role.
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {ROSTER.map((player) => (
            <li key={player.id}>
              <label
                className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-on-panel-soft"
                htmlFor={`role-name-${player.id}`}
              >
                {player.defaultRole} · {player.id}
              </label>
              <input
                id={`role-name-${player.id}`}
                value={roleNames[player.id] ?? player.name}
                placeholder={player.defaultRole}
                onChange={(event) => onRoleName(player.id, event.target.value)}
                className="min-h-11 w-full rounded-xl border-2 border-on-panel/15 bg-white px-3 text-sm font-semibold text-on-panel"
              />
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <ShareLineup roleNames={roleNames} liberoEnabled={liberoOn} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
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
