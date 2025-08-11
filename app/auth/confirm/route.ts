import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { Effect } from "effect";
import { createClient, SupabaseClient } from "@/lib/supabase/server";

// La lógica principal se define como un Effect.
const handleConfirmRoute = (request: NextRequest) =>
	Effect.gen(function* () {
		const { searchParams, nextUrl } = new URL(request.url);
		const token_hash = searchParams.get("token_hash");
		const type = searchParams.get("type") as EmailOtpType | null;
		const next = searchParams.get("next") ?? "/";

		const redirectTo = nextUrl.clone();
		redirectTo.pathname = next;
		redirectTo.searchParams.delete("token_hash");
		redirectTo.searchParams.delete("type");

		if (token_hash && type) {
			// Obtenemos el cliente de Supabase a través del contexto de Effect.
			const supabase = yield* SupabaseClient;

			// Usamos Effect.promise para manejar la promesa de verificación del OTP.
			const { error } = yield* Effect.promise(() =>
				supabase.auth.verifyOtp({
					type,
					token_hash,
				}),
			);

			if (!error) {
				redirectTo.searchParams.delete("next");
				return NextResponse.redirect(redirectTo);
			}
		}

		// Si hay algún error o faltan parámetros, redirigimos a la página de error.
		redirectTo.pathname = "/auth/error";
		return NextResponse.redirect(redirectTo);
	}).pipe(
		// Proporcionamos la capa del cliente de Supabase al Effect.
		Effect.provide(createClient),
	);

export async function GET(request: NextRequest) {
	// Ejecutamos el Effect y devolvemos la respuesta.
	return await Effect.runPromise(handleConfirmRoute(request));
}
