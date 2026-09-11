import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { parseFormationSharePayload } from "@/lib/api-validation";
import { getDb } from "@/lib/db";
import { formationShares, userPreferences } from "@/lib/db/schema";
import {
  SHARE_TTL_MS,
  createShareToken,
} from "@/lib/formation-shares";
import { buildShareUrl } from "@/lib/share-url";

async function loadPreferences(userId: string) {
  const [row] = await getDb()
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function POST(request: Request) {
  const result = await requireApiUser();
  if ("response" in result) return result.response;

  const row = await loadPreferences(result.user.id);
  if (!row) {
    return NextResponse.json({ error: "Preferences not found" }, { status: 500 });
  }

  const snapshot = parseFormationSharePayload({
    roleNames: row.roleNames ?? {},
    liberoEnabled: row.liberoEnabled,
  });
  if ("error" in snapshot) {
    return NextResponse.json({ error: "Preferences not found" }, { status: 500 });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SHARE_TTL_MS);
  const token = createShareToken();

  await getDb().insert(formationShares).values({
    token,
    ownerUserId: result.user.id,
    payload: snapshot.payload,
    createdAt: now,
    expiresAt,
  });

  return NextResponse.json({
    token,
    url: buildShareUrl(token, request),
    expiresAt: expiresAt.toISOString(),
  });
}
