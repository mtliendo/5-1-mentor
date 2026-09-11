import { getDb } from "./index";
import { appUsers, userPreferences, userProgress } from "./schema";

export type AuthProfile = {
  sub: string;
  email?: string | null;
};

/** Upsert app_users and create default preferences + progress rows if missing. */
export async function ensureAppUser(profile: AuthProfile): Promise<string> {
  const db = getDb();
  const now = new Date();
  const email = profile.email ?? null;

  await db
    .insert(appUsers)
    .values({
      id: profile.sub,
      email,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: appUsers.id,
      set: email
        ? { email, updatedAt: now }
        : { updatedAt: now },
    });

  await db
    .insert(userPreferences)
    .values({ userId: profile.sub })
    .onConflictDoNothing({ target: userPreferences.userId });

  await db
    .insert(userProgress)
    .values({ userId: profile.sub })
    .onConflictDoNothing({ target: userProgress.userId });

  return profile.sub;
}
