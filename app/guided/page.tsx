import { GuidedShell } from "@/components/GuidedShell";
import { loadRotations } from "@/content/rotations";

export default function GuidedPage() {
  return <GuidedShell rotations={loadRotations()} />;
}
