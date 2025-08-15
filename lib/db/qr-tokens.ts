import { and, eq, isNull } from "drizzle-orm";
import { ErrorBadRequest } from "@/app/api/Error";
import { db } from "@/lib/db/index";
import { attendance, qrTokens } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export type QrToken = typeof qrTokens.$inferSelect;

export async function findValidToken(token: string): Promise<QrToken> {
	const existing = await db
		.select()
		.from(qrTokens)
		.where(and(eq(qrTokens.token, token), isNull(qrTokens.scannedAt)));

	if (existing.length === 0) {
		throw new ErrorBadRequest("Token already scanned or invalid");
	}

	return existing[0];
}

export async function markTokenAsScanned(token: string, userId: string, clubId: string) {
	await db.transaction(async (tx) => {
		// Ejecutar operaciones atómicamente sin forzar rollback
		await tx.insert(attendance).values({
			attendanceId: nanoid(),
			deviceId: token,
			trainingId: null,
			scanTime: new Date(),
			userId: userId,
			clubId: clubId,
		})
		const updated = await tx
			.update(qrTokens)
			.set({
				// schema has scannedAt as text, store unix seconds as string
				scannedAt: String(Math.floor(Date.now() / 1000)),
				userId: userId,
			})
			.where(and(eq(qrTokens.token, token), isNull(qrTokens.scannedAt)))
			.returning();

		if (updated.length === 0) {
			// No se actualizó ninguna fila: token inexistente o ya escaneado => rollback implícito
			throw new ErrorBadRequest("Token already scanned or invalid");
		}
	});
}
