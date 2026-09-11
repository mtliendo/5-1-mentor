import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Used only by `db:migrate` / studio. Do not invent a real URL.
    url: process.env.DATABASE_URL ?? "postgresql://user:pass@127.0.0.1:5432/placeholder",
  },
});
