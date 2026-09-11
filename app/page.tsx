import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isNeonConfigured } from "@/lib/neon";

const PATHS = [
  {
    href: "/guided",
    kicker: "Start here",
    title: "Guided",
    body: "Seven short lessons from Rotation 1 serve through setter-front.",
  },
  {
    href: "/explore",
    kicker: "Sandbox",
    title: "Explore",
    body: "Spin rotations, passing looks, libero, and the overlap overlay.",
  },
  {
    href: "/quiz",
    kicker: "Check",
    title: "Quiz",
    body: "Six multiple-choice questions. Scores stay on this device for now.",
  },
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();
  const neon = isNeonConfigured();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] bg-court-deep px-5 py-6 text-line">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-line/60">
          Half-court playbook
        </p>
        <h2 className="font-playbook mt-2 text-4xl leading-none">
          Learn the 5-1
          <span className="italic text-amber-200"> by walking it.</span>
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-line/80">
          Phone-first court. Net at the top. Every chip reads{" "}
          <span className="text-line">Name · Role</span>. Play a rotation, then
          quiz yourself.
        </p>
        <p className="mt-4 text-xs text-line/55">
          {user.name}
          {user.source === "local"
            ? " · progress stays on this device"
            : " · signed in"}
          {neon ? " · Neon connected" : ""}
        </p>
      </section>

      <ul className="space-y-3">
        {PATHS.map((path) => (
          <li key={path.href}>
            <Link
              href={path.href}
              className="block rounded-[28px] bg-white/75 px-4 py-4 shadow-[0_10px_24px_rgba(20,35,28,0.06)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {path.kicker}
              </p>
              <h3 className="font-playbook mt-1 text-2xl">{path.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{path.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
