import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

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
    body: "Six multiple-choice questions. Best score follows you when signed in.",
  },
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();
  const signedIn = user.source === "auth0";

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[32px] bg-court-deep px-5 py-7 text-line shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-line">
          Half-court playbook
        </p>
        <h2 className="font-playbook mt-2 text-5xl leading-[0.9] text-white">
          Learn the 5-1
          <span className="italic text-line"> by walking it.</span>
        </h2>
        <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-line/90">
          Phone-first court. Net at the top. Every chip reads{" "}
          <span className="font-extrabold text-white">Name · Role</span>. Play a
          rotation, then quiz yourself.
        </p>
      </section>

      <section className="rounded-[28px] bg-panel px-4 py-4 text-on-panel shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent">
          {signedIn ? "Signed in" : "Guest or sign in"}
        </p>
        <h3 className="font-playbook mt-1 text-2xl leading-tight">
          {signedIn ? `You’re in, ${user.name}.` : "Sign in to coach from any device"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-on-panel-soft">
          Guest: Guided, Explore, and Quiz work on this phone — names, libero, and
          progress stay here. Signed in: custom names, libero on/off, and guided
          progress sync across devices.
        </p>
        {signedIn ? (
          <a
            href="/auth/logout"
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-on-panel px-5 text-sm font-extrabold uppercase tracking-wide text-panel"
          >
            Sign out
          </a>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/auth/login?connection=Username-Password-Authentication&returnTo=/"
              className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)]"
            >
              Sign in with email
            </a>
            <a
              href="/auth/login?connection=google-oauth2&returnTo=/"
              className="inline-flex min-h-12 items-center rounded-full bg-on-panel px-5 text-sm font-extrabold uppercase tracking-wide text-panel"
            >
              Sign in with Google
            </a>
          </div>
        )}
      </section>

      <ul className="space-y-3">
        {PATHS.map((path) => (
          <li key={path.href}>
            <Link
              href={path.href}
              className="block rounded-[28px] bg-panel px-4 py-4 text-on-panel shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
                {path.kicker}
              </p>
              <h3 className="font-playbook mt-1 text-3xl">{path.title}</h3>
              <p className="mt-1 text-sm text-on-panel-soft">{path.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
