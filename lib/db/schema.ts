import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const clubs = sqliteTable("clubs", {
  id: text("club_id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  idNumber: text("id_number").unique(),
  name: text("name"),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  clubId: text("club_id").references(() => clubs.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  role: text("role").default("user")
});

export const qrTokens = sqliteTable("qr_tokens", {
  id: text("id").primaryKey().notNull(),
  token: text("token").notNull().unique(),
  clubId: text("club_id").references(() => clubs.id),
  userId: text("user_id").references(() => users.userId),
  scannedAt: text("scanned_at"),
});

export const trainings = sqliteTable("trainings", {
  trainingId: text("training_id").primaryKey(),
  clubId: text("club_id").references(() => clubs.id, { onDelete: "cascade" }),
  description: text("description"),
  time: text("time")
});

export const attendance = sqliteTable("attendance", {
  attendanceId: text("attendance_id").primaryKey(),
  userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }),
  clubId: text("club_id").references(() => clubs.id, { onDelete: "cascade" }),
  trainingId: text("training_id").references(() => trainings.trainingId, { onDelete: "set null" }),
  scanTime: integer("scan_time", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  deviceId: text("device_id"),
}, (table) => {
  return {
    userIndex: index("idx_attendance_user").on(table.userId),
    clubIndex: index("idx_attendance_club").on(table.clubId),
    trainingIndex: index("idx_attendance_training").on(table.trainingId),
  };
});
