import { QuizShell } from "@/components/QuizShell";

export default function QuizPage() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-line">
        Multiple choice
      </p>
      <QuizShell />
    </div>
  );
}
