import { db } from "@/lib/db/index";
import { qrTokens } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { QRError } from "../errors/qr-errors";

export type QrToken = typeof qrTokens.$inferSelect;

export async function findValidToken(token: string): Promise<QrToken> {
	const existing = await db
		.select()
		.from(qrTokens)
		.where(and(eq(qrTokens.token, token), isNull(qrTokens.scannedAt)));

	if (existing.length === 0) {
		throw new QRError("Token ya escaneado o no válido", 409);
	}

	return existing[0];
}

export async function markTokenAsScanned(token: string, userId: string) {
	await db
		.update(qrTokens)
		.set({
			// schema has scannedAt as text, store unix seconds as string
			scannedAt: String(Math.floor(Date.now() / 1000)),
			userId: userId,
		})
		.where(eq(qrTokens.token, token));
}
