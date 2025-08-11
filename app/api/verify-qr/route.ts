import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";
import { z } from "zod";
import { db } from "@/lib/db/index";
import { users, qrTokens } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { Effect, Cause } from "effect";
import { createClient, SupabaseClient } from "@/lib/supabase/server";

// Define un esquema de Zod para el payload del JWT
const JWTPayloadSchema = z.object({
	clubId: z.string(),
	// Puedes añadir otros campos si son necesarios
});

// Define la lógica principal de la ruta como un Effect.
const handleQrVerification = (request: NextRequest) =>
	Effect.gen(function* ($) {
		console.log("[QR VERIFY] ▶️ Nueva petición recibida");

		// Obtenemos el cliente de Supabase de la capa de Effect
		const supabase = yield* $(SupabaseClient);

		// Obtenemos los claims del usuario
		const { data: sessionData, error: sessionError } = yield* $(
			Effect.tryPromise({
				try: () => supabase.auth.getClaims(),
				catch: (err) => {
					console.error("Error al obtener los claims de Supabase:", err);
					return new Error("Error de Supabase");
				},
			}),
		);

		// Validamos el email del usuario
		const email = sessionData?.claims?.email;
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
		const body = yield* $(
			Effect.tryPromise({
				try: () => request.json(),
				catch: () => new Error("JSON inválido"),
			}),
		);
		console.log("[QR VERIFY] 📨 Body recibido:", body);

		// Validamos el cuerpo con Zod
		const { token } = RequestSchema.parse(body);
		console.log("[QR VERIFY] ✅ Token validado por Zod");

		// Verificamos el JWT
		console.log("[QR VERIFY] 🔐 Verificando JWT...");
		const secret = new TextEncoder().encode(SECRET_KEY);
		const { payload } = yield* $(
			Effect.tryPromise({
				try: () =>
					jwtVerify(token, secret, {
						algorithms: ["HS256"],
						clockTolerance: 15,
					}),
				catch: (err) => {
					console.error("Error al verificar JWT:", err);
					if ((err as any).code === "ERR_JWT_EXPIRED") {
						return new Error("Token expirado");
					}
					if ((err as any).code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
						return new Error("Firma del token inválida");
					}
					return new Error("Token inválido");
				},
			}),
		);
		console.log("[QR VERIFY] ✅ Firma verificada. Payload:", payload);

		const parsedPayload = JWTPayloadSchema.parse(payload);
		// Buscar usuario admin con ese email y clubId
		const usersResult = yield* $(
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(users)
						.where(
							and(
								eq(users.email, email),
								eq(users.clubId, parsedPayload.clubId),
							),
						)
						.limit(1),
				catch: () => new Error("Error al buscar en la base de datos"),
			}),
		);

		if (usersResult.length === 0) {
			console.warn("[QR VERIFY] ⚠️ Usuario no encontrado");
			return NextResponse.json(
				{ saved: false, error: "Usuario no encontrado en el club" },
				{ status: 404 },
			);
		}

		// Buscar el token en la base de datos
		console.log("[QR VERIFY] 🔎 Buscando token en la base de datos...");
		const existing = yield* $(
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(qrTokens)
						.where(and(eq(qrTokens.token, token), isNull(qrTokens.scannedAt))),
				catch: () => new Error("Error al buscar en la base de datos"),
			}),
		);

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
		yield* $(
			Effect.tryPromise({
				try: () =>
					db
						.update(qrTokens)
						.set({
							scannedAt: Math.floor(Date.now() / 1000),
							userId: usersResult[0].userId,
						})
						.where(eq(qrTokens.token, token)),
				catch: (err) => {
					console.error("Error al actualizar token:", err);
					return new Error("Error al actualizar en la base de datos");
				},
			}),
		);

		console.log("[QR VERIFY] ✅ Token actualizado exitosamente");
		return NextResponse.json({
			saved: true,
			message: `Bienvenido ${usersResult[0]?.name}, has sido verificado y escaneado correctamente`,
		});
	}).pipe(
		// Mapeamos los errores del Effect a respuestas de Next.js
		Effect.catchTag("Error", (e) => {
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
			}

			return Effect.succeed(
				NextResponse.json({ saved: false, error: errorMessage }, { status }),
			);
		}),
		Effect.catchAll(() =>
			Effect.succeed(
				NextResponse.json(
					{ saved: false, error: "Error interno del servidor" },
					{ status: 500 },
				),
			),
		),
		// Proporcionamos la capa del cliente de Supabase al programa
		Effect.provide(createClient),
	);

// Exportamos la función POST que ejecuta el Effect
export async function POST(request: NextRequest) {
	return await Effect.runPromise(handleQrVerification(request));
}

// Validación del body para Zod
const RequestSchema = z.object({
	token: z.string().min(1, "Token inválido"),
});
