import { StudyBoard } from "@/components/StudyBoard";
import { loadRotations } from "@/content/rotations";

export default function ExplorePage() {
  const rotations = loadRotations();

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-line">
        Free explore
      </p>
      <StudyBoard rotations={rotations} />
    </div>
  );
}
