import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Definimos la lógica completa de la ruta de API como un Effect.
// Esto nos permite usar la inyección de dependencias y el manejo de errores de Effect-TS.
const handleAuthCallback = async (request: NextRequest) => {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") ?? "/";
	let redirectTo = `${requestUrl.origin}${next}`;

	if (!code) {
		// Si no hay código, devolvemos un error.
		return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
	}

	// Obtenemos el cliente de Supabase usando el tag de SupabaseClient
	// que se proporcionará a este Effect.
	const supabase = await createSupabaseServerClient();

	// Usamos Effect.promise para manejar la promesa de Supabase de manera segura.
	const { data, error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		// Si hay un error de Supabase, devolvemos un error.
		console.error("Error de Supabase:", error);
		return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
	}

	const user = data.user;

	// Consultar si el usuario ya existe.
	// Usamos Effect.promise para envolver la llamada asíncrona a la base de datos.
	const existingUser = await db
		.select()
		.from(users)
		.where(eq(users.userId, user.id))
		.execute();

		if (existingUser.length === 0) {
			try {
				const userData = {
					userId: user.id,
					email: user.email ?? "", // Provide a default empty string if email is undefined
					name: user.user_metadata.name ?? "", // Provide a default empty string
					phone: user.phone ?? null, // phone is already optional, but this makes it explicit
				};
		
				await db.insert(users).values(userData);
				console.log(`Nuevo usuario insertado: ${user.email}`);
				redirectTo = `${requestUrl.origin}/auth/sign-up-success`;
			} catch (dbError) {
				console.error("Error al insertar el usuario en Drizzle:", dbError);
				return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
			}
		}

	// Finalmente, devolvemos la redirección exitosa.
	return NextResponse.redirect(redirectTo);
};

export async function GET(request: NextRequest) {
	// Ejecutamos el Effect y devolvemos la respuesta.
	// runPromise se encargará de ejecutar toda la lógica y devolver el NextResponse
	// al final. Si ocurre algún error no capturado, también lo manejará.
	return await handleAuthCallback(request);
}
