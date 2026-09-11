import { QuizShell } from "@/components/QuizShell";

export default function QuizPage() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Multiple choice
      </p>
      <QuizShell />
    </div>
  );
}
