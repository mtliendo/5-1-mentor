import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { parseShareToken } from "@/lib/api-validation";
import { getDb } from "@/lib/db";
import { formationShares } from "@/lib/db/schema";
import { findShareByToken } from "@/lib/formation-shares";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const result = await requireApiUser();
  if ("response" in result) return result.response;

  const { token } = await params;
  const parsed = parseShareToken(token);
  if ("error" in parsed) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  const share = await findShareByToken(parsed.token);
  if (!share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  if (share.ownerUserId !== result.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!share.revokedAt) {
    await getDb()
      .update(formationShares)
      .set({ revokedAt: new Date() })
      .where(eq(formationShares.id, share.id));
  }

  return NextResponse.json({ ok: true });
}
