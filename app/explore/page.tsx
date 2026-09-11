import { StudyBoard } from "@/components/StudyBoard";
import { loadRotations } from "@/content/rotations";

export default function ExplorePage() {
  const rotations = loadRotations();

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Free explore
      </p>
      <StudyBoard rotations={rotations} />
    </div>
  );
}
