"use client";

import { useMemo, useState } from "react";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { loadProgress, persistProgress } from "@/lib/storage";

export function QuizShell() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = QUIZ_QUESTIONS[index];
  const remaining = QUIZ_QUESTIONS.length - index - (picked ? 0 : 1);

  const resultCopy = useMemo(() => {
    if (score === QUIZ_QUESTIONS.length) return "Clean sweep. You can coach the walkthrough.";
    if (score >= 4) return "Solid. Replay the misses in Explore.";
    return "Warm-up complete. Run Guided once more, then retry.";
  }, [score]);

  function choose(id: string) {
    if (picked) return;
    setPicked(id);
    if (id === question.correctId) setScore((n) => n + 1);
  }

  function advance() {
    if (index === QUIZ_QUESTIONS.length - 1) {
      const nextScore = score;
      const current = loadProgress();
      void persistProgress({
        ...current,
        quizBest: Math.max(current.quizBest, nextScore),
      });
      setDone(true);
      return;
    }
    setPicked(null);
    setIndex((n) => n + 1);
  }

  if (done) {
    return (
      <section className="rounded-[28px] bg-white/80 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Quiz
        </p>
        <h2 className="font-playbook mt-1 text-3xl">
          {score}/{QUIZ_QUESTIONS.length}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{resultCopy}</p>
        <button
          type="button"
          className="mt-5 min-h-11 w-full rounded-2xl bg-ink text-sm font-semibold text-paper"
          onClick={() => {
            setIndex(0);
            setPicked(null);
            setScore(0);
            setDone(false);
          }}
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-white/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Question {index + 1} / {QUIZ_QUESTIONS.length}
        {remaining > 0 && picked ? ` · ${remaining} left after this` : ""}
      </p>
      <h2 className="font-playbook mt-2 text-2xl leading-tight">{question.prompt}</h2>
      <ul className="mt-4 space-y-2">
        {question.choices.map((choice) => {
          const isPicked = picked === choice.id;
          const isCorrect = choice.id === question.correctId;
          const show = Boolean(picked);
          return (
            <li key={choice.id}>
              <button
                type="button"
                onClick={() => choose(choice.id)}
                className={`min-h-12 w-full rounded-2xl px-3 py-3 text-left text-sm font-medium ${
                  show && isCorrect
                    ? "bg-court text-line"
                    : show && isPicked
                      ? "bg-libero text-white"
                      : "bg-paper-deep text-ink hover:bg-paper"
                }`}
              >
                {choice.label}
              </button>
            </li>
          );
        })}
      </ul>
      {picked ? (
        <button
          type="button"
          onClick={advance}
          className="mt-4 min-h-11 w-full rounded-2xl bg-ink text-sm font-semibold text-paper"
        >
          {index === QUIZ_QUESTIONS.length - 1 ? "See score" : "Next"}
        </button>
      ) : null}
    </section>
  );
}
