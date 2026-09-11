"use client";

import { useEffect, useMemo, useState } from "react";
import { StudyBoard } from "./StudyBoard";
import { GUIDED_LESSONS } from "@/lib/guided";
import { loadProgress, persistProgress, syncProgressFromApi } from "@/lib/storage";
import type { RotationContent } from "@/lib/types";

export function GuidedShell({ rotations }: { rotations: RotationContent[] }) {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const lesson = GUIDED_LESSONS[lessonIndex];
  const locked = useMemo(
    () => ({
      rotation: lesson.rotation,
      mode: lesson.mode,
      passingId: lesson.passingId,
      liberoOn: lesson.liberoOn,
      overlay: lesson.overlay,
      stepIndex: lesson.stepIndex,
    }),
    [lesson],
  );

  useEffect(() => {
    let cancelled = false;
    void syncProgressFromApi().then((progress) => {
      if (cancelled) return;
      const idx = GUIDED_LESSONS.findIndex(
        (item) => item.id === progress.guidedLessonId,
      );
      if (idx >= 0) setLessonIndex(idx);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const current = loadProgress();
    const completed = new Set(current.completedLessons);
    completed.add(lesson.id);
    void persistProgress({
      guidedLessonId: lesson.id,
      completedLessons: Array.from(completed),
    });
  }, [hydrated, lesson.id]);

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-ink px-4 py-4 text-paper">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/60">
          Guided · {lessonIndex + 1}/{GUIDED_LESSONS.length}
        </p>
        <h2 className="font-playbook mt-1 text-2xl">{lesson.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-paper/85">{lesson.body}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-11 rounded-2xl bg-paper/10 text-sm font-semibold disabled:opacity-40"
            disabled={lessonIndex === 0}
            onClick={() => setLessonIndex((n) => Math.max(0, n - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="min-h-11 rounded-2xl bg-accent text-sm font-semibold text-white disabled:opacity-40"
            disabled={lessonIndex === GUIDED_LESSONS.length - 1}
            onClick={() =>
              setLessonIndex((n) => Math.min(GUIDED_LESSONS.length - 1, n + 1))
            }
          >
            Next lesson
          </button>
        </div>
      </section>

      <StudyBoard key={lesson.id} rotations={rotations} locked={locked} />
    </div>
  );
}
