import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { loadActiveShare } from "@/lib/formation-shares";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const result = await requireApiUser();
  if ("response" in result) return result.response;

  const { token } = await params;
  const share = await loadActiveShare(token);
  if ("error" in share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  await getDb()
    .update(userPreferences)
    .set({
      roleNames: share.payload.roleNames,
      liberoEnabled: share.payload.liberoEnabled,
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.userId, result.user.id));

  return NextResponse.json({
    liberoEnabled: share.payload.liberoEnabled,
    roleNames: share.payload.roleNames,
  });
}
