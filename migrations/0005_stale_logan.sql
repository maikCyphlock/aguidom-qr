DROP INDEX "qr_tokens_token_unique";--> statement-breakpoint
DROP INDEX "users_id_number_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "role" TO "role" text NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE UNIQUE INDEX `qr_tokens_token_unique` ON `qr_tokens` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_number_unique` ON `users` (`id_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);