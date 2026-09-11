import type { ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/guided", label: "Guided" },
  { href: "/quiz", label: "Quiz" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-4 sm:max-w-3xl sm:pb-10">
      <header className="mb-4 flex items-end justify-between gap-3">
        <Link href="/" className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
            Volleyball study
          </p>
          <h1 className="font-playbook text-3xl leading-none tracking-tight">
            5-1 Mentor
          </h1>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          {NAV.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper-deep hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-paper/95 px-3 py-2 backdrop-blur sm:hidden"
        aria-label="Primary mobile"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center justify-center rounded-2xl text-sm font-semibold text-ink-soft hover:bg-paper-deep hover:text-ink"
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
