import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Definir las tablas sin referencias circulares
export const users = sqliteTable("users", {
	userId: text("user_id").primaryKey(),
	idNumber: text("id_number").unique(),
	name: text("name"),
	email: text("email").unique().notNull(),
	passwordHash: text("password_hash"),
	phone: text("phone"),
	clubId: text("club_id"),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(strftime('%s', 'now'))`,
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`(strftime('%s', 'now'))`,
	),
	role: text("role", { enum: ["admin", "user", "vigilante"] })
		.default("user")
		.notNull(),
});

export const clubs = sqliteTable("clubs", {
	id: text("club_id").primaryKey(),
	name: text("name").notNull(),
	location: text("location"),
	description: text("description"),
	ownerId: text("owner_id"),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`(strftime('%s', 'now'))`,
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`(strftime('%s', 'now'))`,
	),
});

export const qrTokens = sqliteTable("qr_tokens", {
	id: text("id").primaryKey().notNull(),
	token: text("token").notNull().unique(),
	clubId: text("club_id"),
	userId: text("user_id"),
	scannedAt: text("scanned_at"),
});

export const trainings = sqliteTable("trainings", {
	trainingId: text("training_id").primaryKey(),
	clubId: text("club_id"),
	name: text("name").notNull(),
	description: text("description"),
	time: text("time"),
});

export const attendance = sqliteTable("attendance", {
	attendanceId: text("attendance_id").primaryKey(),
	description: text("description"),
	userId: text("user_id"),
	clubId: text("club_id"),
	trainingId: text("training_id"),
	scanTime: integer("scan_time", { mode: "timestamp" })
		.notNull()
		.default(sql`(strftime('%s', 'now'))`),
	deviceId: text("device_id"),
});

// Definir las relaciones después de que todas las tablas estén definidas
export const usersRelations = {
	club: { relationName: "user_club", fields: [users.clubId], references: [clubs.id] },
	ownedClubs: { relationName: "user_owned_clubs", fields: [clubs.ownerId], references: [users.userId] },
	attendance: { relationName: "user_attendance", fields: [attendance.userId], references: [users.userId] },
	qrTokens: { relationName: "user_qr_tokens", fields: [qrTokens.userId], references: [users.userId] },
};

export const clubsRelations = {
	owner: { relationName: "club_owner", fields: [clubs.ownerId], references: [users.userId] },
	members: { relationName: "club_members", fields: [users.clubId], references: [clubs.id] },
	trainings: { relationName: "club_trainings", fields: [trainings.clubId], references: [clubs.id] },
	attendance: { relationName: "club_attendance", fields: [attendance.clubId], references: [clubs.id] },
	qrTokens: { relationName: "club_qr_tokens", fields: [qrTokens.clubId], references: [clubs.id] },
};
