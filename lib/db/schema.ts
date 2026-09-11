import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Matches the existing Neon tables on project dark-mouse-52869701.
 * Court formations are not stored here — the frontend hardcodes those.
 */
export const appUsers = pgTable("app_users", {
  id: text("id").primaryKey(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  liberoEnabled: boolean("libero_enabled").notNull().default(true),
  roleNames: jsonb("role_names")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const userProgress = pgTable(
  "user_progress",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    completed: jsonb("completed")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    lastRotation: smallint("last_rotation").notNull().default(1),
    lastMode: text("last_mode").notNull().default("serve"),
    lastAlternate: text("last_alternate"),
    lastStep: integer("last_step").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "user_progress_last_rotation_check",
      sql`${table.lastRotation} >= 1 AND ${table.lastRotation} <= 6`,
    ),
    check(
      "user_progress_last_mode_check",
      sql`${table.lastMode} in ('serve', 'serve-receive')`,
    ),
  ],
);

export type AppUser = typeof appUsers.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
