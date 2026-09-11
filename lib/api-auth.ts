import { NextResponse } from "next/server";
import { getAuth0Client } from "./auth0";
import { isDatabaseConfigured } from "./db";
import { ensureAppUser } from "./db/ensure-user";

export type AuthedUser = {
  id: string;
  email: string | null;
};

export async function requireApiUser(): Promise<
  { user: AuthedUser } | { response: NextResponse }
> {
  const auth0 = getAuth0Client();
  if (!auth0) {
    return unauthorized();
  }

  try {
    const session = await auth0.getSession();
    const sub = session?.user?.sub;
    if (!sub) {
      return unauthorized();
    }

    if (!isDatabaseConfigured()) {
      return {
        response: NextResponse.json(
          { error: "Database is not configured" },
          { status: 500 },
        ),
      };
    }

    const email =
      typeof session.user.email === "string" ? session.user.email : null;
    const id = await ensureAppUser({ sub, email });
    return { user: { id, email } };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return unauthorized();
    }
    console.error("Failed to ensure app user", error);
    return {
      response: NextResponse.json(
        { error: "Failed to load user" },
        { status: 500 },
      ),
    };
  }
}

function unauthorized() {
  return {
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const status = "status" in error ? error.status : undefined;
  const name = "name" in error ? error.name : undefined;
  return status === 401 || name === "UnauthorizedError";
}
