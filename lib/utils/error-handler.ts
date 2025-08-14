import { NextResponse } from "next/server";
import { z } from "zod";
import type { QRVerificationResponse } from "../../types/qr-verification";
import { QRError } from "../errors/qr-errors";

export function handleError(
	error: unknown,
): NextResponse<QRVerificationResponse> {
	console.error("[QR VERIFY] ❌ Error:", error);

	if (error instanceof QRError) {
		return NextResponse.json(
			{ saved: false, error: error.message },
			{ status: error.statusCode },
		);
	}

	if (error instanceof z.ZodError) {
		const first = error.issues?.[0];
		const message = first?.message ?? "Error de validación";
		return NextResponse.json(
			{ saved: false, error: `Error de validación: ${message}` },
			{ status: 400 },
		);
	}

	return NextResponse.json(
		{ saved: false, error: "Error interno del servidor" },
		{ status: 500 },
	);
}
