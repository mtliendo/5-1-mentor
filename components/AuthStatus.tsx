"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/types";

export function AuthStatus({
  initialUser,
}: {
  initialUser: SessionUser;
}) {
  const pathname = usePathname() || "/";
  const { user, isLoading } = useUser();
  const signedIn = Boolean(user) || initialUser.source === "auth0";
  const label =
    user?.name ??
    user?.email ??
    (initialUser.source === "auth0" ? initialUser.name : null);
  const returnTo = encodeURIComponent(pathname);

  if (isLoading && !signedIn) {
    return (
      <a
        href={`/auth/login?returnTo=${returnTo}`}
        className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)]"
      >
        Sign in
      </a>
    );
  }

  if (signedIn) {
    return (
      <div className="flex items-center gap-2">
        <p className="hidden max-w-[8rem] truncate text-xs font-semibold text-line sm:block">
          {label}
        </p>
        <a
          href="/auth/logout"
          className="inline-flex min-h-11 items-center rounded-full bg-line px-4 text-sm font-extrabold uppercase tracking-wide text-paper"
        >
          Sign out
        </a>
      </div>
    );
  }

  return (
    <a
      href={`/auth/login?returnTo=${returnTo}`}
      className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(255,59,0,0.35)]"
    >
      Sign in
    </a>
  );
}
