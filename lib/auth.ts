import { getAuth0Client, isAuth0Configured } from "./auth0";
import type { SessionUser } from "./types";

export { isAuth0Configured };

/**
 * UI helper: Auth0 session when configured and signed in, otherwise a local guest.
 * Session-protected APIs use `requireApiUser()` and return 401 instead of this guest.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const auth0 = getAuth0Client();
  if (auth0) {
    try {
      const session = await auth0.getSession();
      if (session?.user?.sub) {
        return {
          id: session.user.sub,
          name: session.user.name ?? session.user.email ?? "Player",
          email: session.user.email,
          source: "auth0",
        };
      }
    } catch {
      // Fall through to the local guest used by the MVP UI.
    }
  }

  return {
    id: "local-player",
    name: "Guest player",
    source: "local",
  };
}
