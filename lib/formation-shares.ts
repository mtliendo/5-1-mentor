import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  parseFormationSharePayload,
  parseShareToken,
} from "./api-validation";
import { getDb } from "./db";
import {
  formationShares,
  type FormationShare,
  type FormationSharePayload,
} from "./db/schema";

export const SHARE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function createShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isShareActive(row: FormationShare, now = new Date()): boolean {
  if (row.revokedAt) return false;
  return row.expiresAt.getTime() > now.getTime();
}

export async function findShareByToken(
  token: string,
): Promise<FormationShare | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(formationShares)
    .where(eq(formationShares.token, token))
    .limit(1);
  return row ?? null;
}

export async function loadActiveShare(token: unknown): Promise<
  | { share: FormationShare; payload: FormationSharePayload }
  | { error: "not_found" }
> {
  const parsed = parseShareToken(token);
  if ("error" in parsed) return { error: "not_found" };

  const share = await findShareByToken(parsed.token);
  if (!share || !isShareActive(share)) return { error: "not_found" };

  const payload = parseFormationSharePayload(share.payload);
  if ("error" in payload) return { error: "not_found" };

  return { share, payload: payload.payload };
}

export function toPublicShareJson(
  payload: FormationSharePayload,
  expiresAt: Date,
) {
  return {
    roleNames: payload.roleNames,
    liberoEnabled: payload.liberoEnabled,
    expiresAt: expiresAt.toISOString(),
  };
}
