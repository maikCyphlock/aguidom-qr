import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { z } from "zod";
import { db } from "@/lib/db/index";
import { users, qrTokens } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Define un esquema de Zod para el payload del JWT
const JWTPayloadSchema = z.object({
	clubId: z.string(),
	// Puedes añadir otros campos si son necesarios
});

// Define la lógica principal de la ruta como un Effect.
const handleQrVerification = async (request: NextRequest) => {
	console.log("[QR VERIFY] ▶️ Nueva petición recibida");

	try {
		// Obtenemos el cliente de Supabase
		const supabase = await createSupabaseServerClient();

		// Obtenemos los claims del usuario
		const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

		// Validamos el email del usuario
		const email = sessionData?.session?.user?.email;
		if (!email) {
			return NextResponse.json(
				{ error: "Unauthorized: no email found in session" },
				{ status: 401 },
			);
		}

		const SECRET_KEY = process.env.JWT_SECRET_KEY;
		if (!SECRET_KEY || SECRET_KEY.length < 32) {
			console.error("[QR VERIFY] ❌ JWT_SECRET_KEY inválida");
			return NextResponse.json(
				{
					error:
						"Configuración inválida: JWT_SECRET_KEY no está configurada correctamente",
				},
				{ status: 500 },
			);
		}

		// Parseamos el cuerpo de la petición de manera segura
		const body = await request.json();
		console.log("[QR VERIFY] 📨 Body recibido:", body);

		// Validamos el cuerpo con Zod
		const { token } = RequestSchema.parse(body);
		console.log("[QR VERIFY] ✅ Token validado por Zod");

		// Verificamos el JWT
		console.log("[QR VERIFY] 🔐 Verificando JWT...");
		const secret = new TextEncoder().encode(SECRET_KEY);
		let payload: JWTPayload;
		try {
			const { payload: verifiedPayload } = await jwtVerify(token, secret, {
				algorithms: ["HS256"],
				clockTolerance: 15,
			});
			payload = verifiedPayload;
		} catch (err: any) {
			console.error("Error al verificar JWT:", err);
			let errorMessage = "Token inválido";
			let status = 400;
			if (err.code === "ERR_JWT_EXPIRED") {
				errorMessage = "El token ha expirado.";
				status = 401;
			} else if (err.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
				errorMessage = "La firma del token es inválida.";
				status = 401;
			}
			return NextResponse.json({ saved: false, error: errorMessage }, { status });
		}
		console.log("[QR VERIFY] ✅ Firma verificada. Payload:", payload);

		const parsedPayload = JWTPayloadSchema.parse(payload);
		// Buscar usuario admin con ese email y clubId
		const usersResult = await db
			.select()
			.from(users)
			.where(
				and(
					eq(users.email, email),
					eq(users.clubId, parsedPayload.clubId),
				),
			)
			.limit(1);

		if (usersResult.length === 0) {
			console.warn("[QR VERIFY] ⚠️ Usuario no encontrado");
			return NextResponse.json(
				{ saved: false, error: "Usuario no encontrado en el club" },
				{ status: 404 },
			);
		}

		// Buscar el token en la base de datos
		console.log("[QR VERIFY] 🔎 Buscando token en la base de datos...");
		const existing = await db
			.select()
			.from(qrTokens)
			.where(and(eq(qrTokens.token, token), isNull(qrTokens.scannedAt)));

		if (existing.length === 0) {
			console.warn("[QR VERIFY] ⚠️ Token ya fue escaneado o no existe");
			return NextResponse.json(
				{ saved: false, error: "Token ya escaneado o no válido" },
				{ status: 409 },
			);
		}

		// Marcar como escaneado y actualizar el usuario
		console.log(
			"[QR VERIFY] 🟢 Token válido. Procediendo a marcar como escaneado...",
		);
		await db
			.update(qrTokens)
			.set({
				scannedAt: Math.floor(Date.now() / 1000),
				userId: usersResult[0].userId,
			})
			.where(eq(qrTokens.token, token));

		console.log("[QR VERIFY] ✅ Token actualizado exitosamente");
		return NextResponse.json({
			saved: true,
			message: `Bienvenido ${usersResult[0]?.name}, has sido verificado y escaneado correctamente`,
		});
	} catch (e: any) {
		console.error("[QR VERIFY] ❌ Error en el proceso:", e);
		let status = 500;
		let errorMessage = "Error interno del servidor";

		if (e.message.includes("Token inválido")) {
			status = 400;
			errorMessage =
				"El token no es un JWT válido o tiene un formato incorrecto.";
		} else if (e.message.includes("Token expirado")) {
			status = 401;
			errorMessage = "El token ha expirado.";
		} else if (e.message.includes("Firma del token inválida")) {
			status = 401;
			errorMessage = "La firma del token es inválida.";
		} else if (e.message.includes("Configuración inválida")) {
			status = 500;
			errorMessage = e.message;
		} else if (e.name === "ZodError") {
			status = 400;
			errorMessage = `Error de validación: ${e.errors[0].message}`;
		}

		return NextResponse.json({ saved: false, error: errorMessage }, { status });
	}
};

// Exportamos la función POST que ejecuta el Effect
export async function POST(request: NextRequest) {
	return await handleQrVerification(request);
}

// Validación del body para Zod
const RequestSchema = z.object({
	token: z.string().min(1, "Token inválido"),
});
