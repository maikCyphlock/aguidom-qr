import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// La lógica principal se define como un Effect.
const handleConfirmRoute = async (request: NextRequest) => {
    const url = new URL(request.url);
    const token_hash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type") as EmailOtpType | null;
    const next = url.searchParams.get("next") ?? "/";

    const redirectTo = new URL(url);
    redirectTo.pathname = next;
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");

    if (token_hash && type) {
        // Obtenemos el cliente de Supabase
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

				if (!error) {
				redirectTo.searchParams.delete("next");
				return NextResponse.redirect(redirectTo);
			}
		}

		// Si hay algún error o faltan parámetros, redirigimos a la página de error.
		redirectTo.pathname = "/auth/error";
		return NextResponse.redirect(redirectTo);
	};

export async function GET(request: NextRequest) {
	// Ejecutamos el Effect y devolvemos la respuesta.
	return await handleConfirmRoute(request);
}
