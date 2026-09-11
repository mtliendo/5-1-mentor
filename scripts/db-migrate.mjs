#!/usr/bin/env node
/**
 * Runs drizzle-kit migrate only against a real DATABASE_URL.
 * Neon already has app_users / user_preferences / user_progress;
 * the baseline SQL is IF NOT EXISTS so a re-run is a no-op on those tables.
 */
import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";
const looksPlaceholder =
  !url ||
  url.includes("127.0.0.1:5432/placeholder") ||
  url.includes("user:pass@") ||
  url === "postgresql://user:pass@127.0.0.1:5432/placeholder";

if (looksPlaceholder) {
  console.error(
    "db:migrate refused: set DATABASE_URL to your Neon connection string.\n" +
      "Those three tables already exist on Neon — this only records/applies the baseline schema.\n" +
      "Do not invent a URL.",
  );
  process.exit(1);
}

const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
