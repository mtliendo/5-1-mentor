import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { parsePreferencesPatch, readJsonBody } from "@/lib/api-validation";
import { getDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";

function toJson(row: typeof userPreferences.$inferSelect) {
  return {
    liberoEnabled: row.liberoEnabled,
    roleNames: row.roleNames ?? {},
  };
}

async function loadPreferences(userId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function GET() {
  const result = await requireApiUser();
  if ("response" in result) return result.response;

  const row = await loadPreferences(result.user.id);
  if (!row) {
    return NextResponse.json({ error: "Preferences not found" }, { status: 500 });
  }

  return NextResponse.json(toJson(row));
}

export async function PUT(request: Request) {
  const result = await requireApiUser();
  if ("response" in result) return result.response;

  const body = await readJsonBody(request);
  if ("error" in body) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = parsePreferencesPatch(body.value);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (Object.keys(parsed.patch).length > 0) {
    await getDb()
      .update(userPreferences)
      .set({
        ...parsed.patch,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, result.user.id));
  }

  const row = await loadPreferences(result.user.id);
  if (!row) {
    return NextResponse.json({ error: "Preferences not found" }, { status: 500 });
  }

  return NextResponse.json(toJson(row));
}
