import { type NextRequest, NextResponse } from "next/server";
import { requestSchema } from "@/lib/validation/schemas";
import { verifyQRToken } from "@/lib/services/qr-verification";
import { apiErrorHandler } from "@/lib/utils/error-handler";

const handleQrVerification = async (request: NextRequest) => {
	console.log("[QR VERIFY] ▶️ Nueva petición recibida");
	try {
		// Parsear y validar request
		const body = await request.json();
		const validatedRequest = requestSchema.parse(body);

		console.log("[QR VERIFY] ✅ Request validado");

		// Procesar verificación
		const result = await verifyQRToken(validatedRequest);

		console.log("[QR VERIFY] ✅ Verificación exitosa");
		return NextResponse.json(result);
	} catch (error) {
		return apiErrorHandler(error);
	}
};

// Exportamos la función POST que ejecuta el Effect
// Este endpoint maneja la verificación de los códigos QR
export async function POST(request: NextRequest) {
	return await handleQrVerification(request);
}
