import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { parseProgressPatch, readJsonBody } from "@/lib/api-validation";
import { getDb } from "@/lib/db";
import { userProgress } from "@/lib/db/schema";

function toJson(row: typeof userProgress.$inferSelect) {
  return {
    completed: row.completed ?? {},
    lastRotation: row.lastRotation,
    lastMode: row.lastMode,
    lastAlternate: row.lastAlternate,
    lastStep: row.lastStep,
  };
}

async function loadProgress(userId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function GET() {
  const result = await requireApiUser();
  if ("response" in result) return result.response;

  const row = await loadProgress(result.user.id);
  if (!row) {
    return NextResponse.json({ error: "Progress not found" }, { status: 500 });
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

  const parsed = parseProgressPatch(body.value);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (Object.keys(parsed.patch).length > 0) {
    await getDb()
      .update(userProgress)
      .set({
        ...parsed.patch,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, result.user.id));
  }

  const row = await loadProgress(result.user.id);
  if (!row) {
    return NextResponse.json({ error: "Progress not found" }, { status: 500 });
  }

  return NextResponse.json(toJson(row));
}
