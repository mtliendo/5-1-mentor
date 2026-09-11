import { isDatabaseConfigured } from "./db";

/**
 * Neon / serverless SQL hook.
 * Persisted preferences and progress live at /api/me/*.
 */
export function isNeonConfigured(): boolean {
  return isDatabaseConfigured();
}
