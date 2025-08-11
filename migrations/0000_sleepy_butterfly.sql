CREATE TABLE `attendance` (
	`attendance_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`club_id` text,
	`training_id` text,
	`scan_time` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`device_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`training_id`) REFERENCES `trainings`(`training_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_attendance_user` ON `attendance` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_attendance_club` ON `attendance` (`club_id`);--> statement-breakpoint
CREATE INDEX `idx_attendance_training` ON `attendance` (`training_id`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`club_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`description` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `qr_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`club_id` text,
	`user_id` text,
	`scanned_at` text,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_tokens_token_unique` ON `qr_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `trainings` (
	`training_id` text PRIMARY KEY NOT NULL,
	`club_id` text,
	`description` text,
	`time` text,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
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
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_number_unique` ON `users` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);