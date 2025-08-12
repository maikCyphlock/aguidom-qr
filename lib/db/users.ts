import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { QRError } from "../errors/qr-errors";

export type User = typeof users.$inferSelect;

export async function findUserByEmailAndClub(
	email: string,
	clubId: string,
): Promise<User> {
	const result = await db
		.select()
		.from(users)
		.where(and(eq(users.email, email), eq(users.clubId, clubId)))
		.limit(1);

	if (result.length === 0) {
		throw new QRError("Usuario no encontrado en el club", 404);
	}

	return result[0];
}
