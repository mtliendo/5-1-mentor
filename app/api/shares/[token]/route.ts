import { NextResponse } from "next/server";
import { requireDatabase } from "@/lib/api-auth";
import { loadActiveShare, toPublicShareJson } from "@/lib/formation-shares";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const dbReady = requireDatabase();
  if ("response" in dbReady) return dbReady.response;

  const { token } = await params;
  const result = await loadActiveShare(token);
  if ("error" in result) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  return NextResponse.json(
    toPublicShareJson(result.payload, result.share.expiresAt),
    { headers: { "Cache-Control": "no-store" } },
  );
}
