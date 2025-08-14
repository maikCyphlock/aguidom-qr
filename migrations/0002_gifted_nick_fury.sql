PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_clubs` (
	`club_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`description` text,
	`owner_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_clubs`("club_id", "name", "location", "description", "owner_id", "created_at", "updated_at") SELECT "club_id", "name", "location", "description", "owner_id", "created_at", "updated_at" FROM `clubs`;--> statement-breakpoint
DROP TABLE `clubs`;--> statement-breakpoint
ALTER TABLE `__new_clubs` RENAME TO `clubs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
	`role` text DEFAULT 'user',
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_users`("user_id", "id_number", "name", "email", "password_hash", "phone", "club_id", "created_at", "updated_at", "role") SELECT "user_id", "id_number", "name", "email", "password_hash", "phone", "club_id", "created_at", "updated_at", "role" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_number_unique` ON `users` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
DROP INDEX `idx_attendance_user`;--> statement-breakpoint
DROP INDEX `idx_attendance_club`;--> statement-breakpoint
DROP INDEX `idx_attendance_training`;