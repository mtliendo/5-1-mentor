import type { SessionUser } from "./types";

/**
 * Auth0 hook — wire `getSession()` here when AUTH0_* env vars exist.
 * The MVP never reads secrets; it falls back to a local guest.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const configured = Boolean(
    process.env.AUTH0_SECRET &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_ISSUER_BASE_URL,
  );

  if (configured) {
    // TODO: return (await auth0.getSession())?.user mapped to SessionUser
  }

  return {
    id: "local-player",
    name: "Guest player",
    source: "local",
  };
}

export function isAuth0Configured(): boolean {
  return Boolean(process.env.AUTH0_SECRET);
}
