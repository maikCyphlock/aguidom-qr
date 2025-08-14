PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`attendance_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`club_id` text,
	`training_id` text,
	`scan_time` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`device_id` text
);
--> statement-breakpoint
INSERT INTO `__new_attendance`("attendance_id", "user_id", "club_id", "training_id", "scan_time", "device_id") SELECT "attendance_id", "user_id", "club_id", "training_id", "scan_time", "device_id" FROM `attendance`;--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_clubs` (
	`club_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`description` text,
	`owner_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_clubs`("club_id", "name", "location", "description", "owner_id", "created_at", "updated_at") SELECT "club_id", "name", "location", "description", "owner_id", "created_at", "updated_at" FROM `clubs`;--> statement-breakpoint
DROP TABLE `clubs`;--> statement-breakpoint
ALTER TABLE `__new_clubs` RENAME TO `clubs`;--> statement-breakpoint
CREATE TABLE `__new_qr_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`club_id` text,
	`user_id` text,
	`scanned_at` text
);
--> statement-breakpoint
INSERT INTO `__new_qr_tokens`("id", "token", "club_id", "user_id", "scanned_at") SELECT "id", "token", "club_id", "user_id", "scanned_at" FROM `qr_tokens`;--> statement-breakpoint
DROP TABLE `qr_tokens`;--> statement-breakpoint
ALTER TABLE `__new_qr_tokens` RENAME TO `qr_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `qr_tokens_token_unique` ON `qr_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `__new_trainings` (
	`training_id` text PRIMARY KEY NOT NULL,
	`club_id` text,
	`name` text NOT NULL,
	`description` text,
	`time` text
);
--> statement-breakpoint
INSERT INTO `__new_trainings`("training_id", "club_id", "name", "description", "time") SELECT "training_id", "club_id", "name", "description", "time" FROM `trainings`;--> statement-breakpoint
DROP TABLE `trainings`;--> statement-breakpoint
ALTER TABLE `__new_trainings` RENAME TO `trainings`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`id_number` text,
	`name` text,
	`email` text NOT NULL,
	`password_hash` text,
	`phone` text,
	`club_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`role` text DEFAULT 'user'
);
--> statement-breakpoint
INSERT INTO `__new_users`("user_id", "id_number", "name", "email", "password_hash", "phone", "club_id", "created_at", "updated_at", "role") SELECT "user_id", "id_number", "name", "email", "password_hash", "phone", "club_id", "created_at", "updated_at", "role" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_number_unique` ON `users` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);