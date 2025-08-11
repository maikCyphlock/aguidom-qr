import { Effect, Cause } from "effect";
import { createClient, SupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/** Extrae mensaje raíz de errores anidados (defensivo para logs/inspección) */
function getRootErrorMessage(err: unknown): string | undefined {
	try {
		if (!err) return undefined;
		const seen = new Set<any>();
		const walk = (x: any): string | undefined => {
			if (!x || typeof x !== "object")
				return typeof x === "string" ? x : undefined;
			if (seen.has(x)) return undefined;
			seen.add(x);
			if (typeof x.message === "string") return x.message;
			if (x.cause) {
				const m = walk(x.cause);
				if (m) return m;
			}
			for (const k of Object.getOwnPropertyNames(x)) {
				if (
					k.toLowerCase().includes("cause") ||
					k.toLowerCase().includes("error")
				) {
					const m = walk(x[k]);
					if (m) return m;
				}
			}
			try {
				const s = String(x);
				if (s && s !== "[object Object]") return s;
			} catch {}
			return undefined;
		};
		return walk(err);
	} catch {
		return undefined;
	}
}

/** Effects */
const updateProfileEffect = (
	userId: string,
	name: string,
	idNumber: string,
	phone?: string,
) =>
	Effect.tryPromise({
		try: () =>
			db
				.update(users)
				.set({
					name,
					idNumber,
					phone,
					updatedAt: new Date(),
				})
				.where(eq(users.userId, userId)),
		catch: (err) => {
			console.error("[updateProfile] internal error:", err);
			const root = getRootErrorMessage(err) ?? "";
			if (
				root.includes("UNIQUE constraint failed") &&
				root.includes("users.id_number")
			) {
				return new Error("ID_NUMBER_CONFLICT");
			}
			return new Error("DB_ERROR");
		},
	});

export async function POST(req: NextRequest) {
	// parseo defensivo
	let ds: any;
	try {
		ds = await req.json();
	} catch {
		return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
	}

	const { name, idNumber, phone } = ds ?? {};
	if (!name || !idNumber) {
		return NextResponse.json(
			{ error: "Name and ID Number are required" },
			{ status: 400 },
		);
	}

	const program = Effect.gen(function* ($) {
		// A diferencia del código anterior, obtenemos el cliente de Supabase
		// directamente del contexto de Effect.
		const supabase = yield* $(SupabaseClient);

		const {
			data: { user },
		} = yield* $(
			Effect.tryPromise({
				try: () => supabase.auth.getUser(),
				catch: (err) => {
					console.error("[getUser] internal error:", err);
					return new Error("GET_USER_ERROR");
				},
			}),
		);

		if (!user) {
			// fallo esperado por auth
			return yield* $(Effect.fail(new Error("USER_NOT_LOGGED_IN")));
		}

		// Si falla, updateProfileEffect retornará Error("ID_NUMBER_CONFLICT") o Error("DB_ERROR")
		yield* $(updateProfileEffect(user.id, name, idNumber, phone));

		return NextResponse.json({ message: "Profile updated successfully" });
	});

	// Mapeamos éxito/fallo a NextResponse. IMPORTANTE: devolver un NextResponse, no una función.
	const handled = Effect.matchEffect(program, {
		onSuccess: (res) => Effect.succeed(res as NextResponse),
		onFailure: (cause) => {
			// Inspect & logging
			console.error("[POST /api/profile] cause:", cause);

			const root = getRootErrorMessage(cause) ?? "";

			// Errores esperados - respondemos con mensajes adecuados
			if (root.includes("USER_NOT_LOGGED_IN")) {
				return Effect.succeed(
					NextResponse.json({ error: "User not logged in" }, { status: 401 }),
				);
			}
			if (root.includes("ID_NUMBER_CONFLICT")) {
				return Effect.succeed(
					NextResponse.json(
						{ error: "El número de identificación ya está en uso." },
						{ status: 409 },
					),
				);
			}
			if (
				root.includes("CREATE_CLIENT_ERROR") ||
				root.includes("GET_USER_ERROR") ||
				root.includes("DB_ERROR")
			) {
				return Effect.succeed(
					NextResponse.json(
						{
							error:
								"Ha ocurrido un error interno. Intenta nuevamente más tarde.",
						},
						{ status: 500 },
					),
				);
			}

			// Si es un defect (die) — usar Cause helper si está disponible
			try {
				if (Cause.isDieType(cause)) {
					console.error("[POST /api/profile] defect (die) detected:", cause);
					return Effect.succeed(
						NextResponse.json(
							{
								error:
									"Error crítico en el servidor. El equipo fue notificado.",
							},
							{ status: 500 },
						),
					);
				}
			} catch {
				// ignore
			}

			// Fallback genérico
			return Effect.succeed(
				NextResponse.json(
					{
						error:
							"Ha ocurrido un error interno. Intenta nuevamente más tarde.",
					},
					{ status: 500 },
				),
			);
		},
	}).pipe(
		// Proporcionamos la capa del cliente de Supabase al programa principal.
		Effect.provide(createClient),
	);

	// Ejecuta y devuelve la respuesta concreta (ya es un NextResponse)
	return Effect.runPromise(handled);
}
