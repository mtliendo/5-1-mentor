"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/types";

function AuthLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center rounded-full bg-ink px-3 text-xs font-semibold text-paper"
    >
      {children}
    </a>
  );
}

export function AuthStatus({
  initialUser,
  authConfigured,
}: {
  initialUser: SessionUser;
  authConfigured: boolean;
}) {
  const pathname = usePathname() || "/";
  const { user, isLoading } = useUser();
  const signedIn = Boolean(user) || initialUser.source === "auth0";
  const label =
    user?.name ??
    user?.email ??
    (initialUser.source === "auth0" ? initialUser.name : null);

  if (!authConfigured) {
    return (
      <p className="text-right text-[11px] font-medium leading-tight text-ink-soft">
        Guest
      </p>
    );
  }

  if (isLoading && !signedIn) {
    return (
      <p className="text-right text-[11px] font-medium leading-tight text-ink-soft">
        …
      </p>
    );
  }

  if (signedIn) {
    return (
      <div className="flex max-w-[11rem] flex-col items-end gap-1 sm:max-w-none sm:flex-row sm:items-center sm:gap-2">
        <p className="max-w-full truncate text-[11px] font-medium text-ink-soft">
          {label}
        </p>
        <AuthLink href="/auth/logout">Sign out</AuthLink>
      </div>
    );
  }

  const returnTo = encodeURIComponent(pathname);
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <AuthLink href={`/auth/login?connection=Username-Password-Authentication&returnTo=${returnTo}`}>
        Email
      </AuthLink>
      <AuthLink href={`/auth/login?connection=google-oauth2&returnTo=${returnTo}`}>
        Google
      </AuthLink>
    </div>
  );
}
