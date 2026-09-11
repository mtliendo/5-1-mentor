"use client";

import { useEffect, useMemo, useState } from "react";
import { BoardControls } from "./BoardControls";
import { Court } from "./Court";
import { resolveStepPlayers } from "@/lib/libero";
import { usePrefersReducedMotion } from "@/lib/motion";
import { applyRoleNames, getRosterPlayer } from "@/lib/roster";
import {
  defaultPassingId,
  getActiveSteps,
  getRotation,
  listPassingAlternates,
} from "@/lib/rotations";
import {
  persistPreferences,
  persistProgress,
  syncPreferencesFromApi,
  syncProgressFromApi,
} from "@/lib/storage";
import type {
  PlayerId,
  PlayMode,
  RotationContent,
  RotationId,
} from "@/lib/types";

export function StudyBoard({
  rotations,
  locked,
}: {
  rotations: RotationContent[];
  locked?: {
    rotation: RotationId;
    mode: PlayMode;
    passingId?: string;
    liberoOn?: boolean;
    overlay?: boolean;
    stepIndex?: number;
  };
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [rotationId, setRotationId] = useState<RotationId>(
    locked?.rotation ?? 1,
  );
  const [mode, setMode] = useState<PlayMode>(locked?.mode ?? "serve-receive");
  const [passingId, setPassingId] = useState(
    locked?.passingId ??
      defaultPassingId(getRotation(rotations, locked?.rotation ?? 1)),
  );
  const [liberoOn, setLiberoOn] = useState(locked?.liberoOn ?? true);
  const [overlay, setOverlay] = useState(locked?.overlay ?? false);
  const [stepIndex, setStepIndex] = useState(locked?.stepIndex ?? 0);
  const [playing, setPlaying] = useState(false);
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  const rotation = getRotation(rotations, rotationId);
  const alternates = listPassingAlternates(rotation);
  const steps = getActiveSteps(rotation, mode, passingId);
  const safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const step = steps[safeIndex];

  const players = useMemo(() => {
    const resolved = step ? resolveStepPlayers(rotation, step, liberoOn) : [];
    return applyRoleNames(resolved, roleNames);
  }, [rotation, step, liberoOn, roleNames]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [progress, prefs] = await Promise.all([
        syncProgressFromApi(),
        syncPreferencesFromApi(),
      ]);
      if (cancelled) return;

      if (!locked) {
        const nextRotation = getRotation(rotations, progress.lastRotation);
        const nextMode = progress.lastMode;
        const nextAlternates = listPassingAlternates(nextRotation);
        const nextPassing =
          progress.lastAlternate &&
          nextAlternates.some((item) => item.id === progress.lastAlternate)
            ? progress.lastAlternate
            : defaultPassingId(nextRotation);
        const nextSteps = getActiveSteps(nextRotation, nextMode, nextPassing);
        setRotationId(progress.lastRotation);
        setMode(nextMode);
        setPassingId(nextPassing);
        setStepIndex(
          Math.min(progress.lastStep, Math.max(0, nextSteps.length - 1)),
        );
      }

      if (locked?.liberoOn === undefined) {
        setLiberoOn(prefs.liberoEnabled);
      }
      setRoleNames(prefs.roleNames);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [locked, rotations]);

  useEffect(() => {
    if (!playing) return;
    const delay = reducedMotion ? 1800 : 1200;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, delay);
    return () => window.clearInterval(timer);
  }, [playing, steps.length, reducedMotion]);

  useEffect(() => {
    if (!hydrated) return;
    void persistProgress({
      lastRotation: rotationId,
      lastMode: mode,
      lastAlternate: passingId,
      lastStep: safeIndex,
    });
  }, [hydrated, rotationId, mode, passingId, safeIndex]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      const patch =
        locked?.liberoOn === undefined
          ? { liberoEnabled: liberoOn, roleNames }
          : { roleNames };
      void persistPreferences(patch);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [hydrated, liberoOn, roleNames, locked]);

  function changeRotation(id: RotationId) {
    setRotationId(id);
    setStepIndex(0);
    setPlaying(false);
    const next = getRotation(rotations, id);
    if (!listPassingAlternates(next).some((item) => item.id === passingId)) {
      setPassingId(defaultPassingId(next));
    }
  }

  function changeMode(next: PlayMode) {
    setMode(next);
    setStepIndex(0);
    setPlaying(false);
  }

  function changeRoleName(id: PlayerId, name: string) {
    setRoleNames((current) => {
      const next = { ...current };
      const fallback = getRosterPlayer(id).name;
      if (!name || name === fallback) {
        delete next[id];
      } else {
        next[id] = name;
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-playbook text-2xl leading-tight">{rotation.title}</p>
        <p className="mt-1 text-sm text-ink-soft">{rotation.summary}</p>
        <p className="mt-2 text-xs text-ink-soft/80">{rotation.notes}</p>
      </div>

      <Court
        players={players}
        overlay={overlay}
        reducedMotion={reducedMotion}
      />

      {step ? (
        <p className="rounded-2xl bg-accent-soft px-3 py-2 text-sm text-ink">
          <span className="font-semibold">{step.label}.</span> {step.cue}
        </p>
      ) : null}

      <BoardControls
        rotation={rotationId}
        mode={mode}
        passingId={passingId}
        passingAlternates={alternates}
        liberoOn={liberoOn}
        overlay={overlay}
        playing={playing}
        stepLabel={step?.label ?? "—"}
        stepIndex={safeIndex}
        stepCount={steps.length}
        roleNames={roleNames}
        onRoleName={changeRoleName}
        onRotation={changeRotation}
        onMode={changeMode}
        onPassing={(id) => {
          setPassingId(id);
          setStepIndex(0);
          setPlaying(false);
        }}
        onLibero={setLiberoOn}
        onOverlay={setOverlay}
        onPrev={() => {
          setPlaying(false);
          setStepIndex((current) => Math.max(0, current - 1));
        }}
        onNext={() => {
          setPlaying(false);
          setStepIndex((current) => Math.min(steps.length - 1, current + 1));
        }}
        onPlayAll={() => {
          if (playing) {
            setPlaying(false);
            return;
          }
          if (safeIndex >= steps.length - 1) setStepIndex(0);
          setPlaying(true);
        }}
        onReset={() => {
          setPlaying(false);
          setStepIndex(0);
        }}
      />
    </div>
  );
}
