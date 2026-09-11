import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { AuthStatus } from "./AuthStatus";
import type { SessionUser } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/guided", label: "Guided" },
  { href: "/quiz", label: "Quiz" },
] as const;

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser;
}) {
  return (
    <div className="energy-grid mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-3 sm:max-w-3xl lg:max-w-6xl lg:pb-10">
      <header className="sticky top-0 z-30 mb-4 flex items-center justify-between gap-3 border-b border-line/15 bg-paper/90 py-3 backdrop-blur">
        <Link href="/" className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-line">
            Volleyball study
          </p>
          <h1 className="font-playbook text-3xl leading-none tracking-tight text-ink sm:text-4xl">
            5-1 Mentor
          </h1>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-bold text-ink-soft hover:bg-paper-deep hover:text-line"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Suspense
            fallback={
              <span className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-extrabold uppercase tracking-wide text-white">
                Sign in
              </span>
            }
          >
            <AuthStatus initialUser={user} />
          </Suspense>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line/20 bg-paper/95 px-3 py-2 backdrop-blur lg:hidden"
        aria-label="Primary mobile"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center justify-center rounded-2xl text-sm font-extrabold text-ink-soft hover:bg-paper-deep hover:text-line"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
