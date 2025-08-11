import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient, SupabaseClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { redirect } from "next/navigation";

// Definimos la lógica de la página como un Effect.
const pageLogic = Effect.gen(function* ($) {
	// Obtenemos el cliente de Supabase desde la capa de inyección
	const supabase = yield* $(SupabaseClient);

	// Obtenemos el usuario de forma segura con Effect.tryPromise
	const { data, error } = yield* $(
		Effect.tryPromise(() => supabase.auth.getUser()),
	);

	// Si no hay usuario, redirigimos a la página de inicio de sesión
	if (!data.user) {
		return redirect("/auth/login");
	}

	try {
		// Buscamos si el usuario ya existe en Drizzle
		const userOnDb = yield* $(
			Effect.tryPromise(() =>
				db.select().from(users).where(eq(users.userId, data.user!.id)).get(),
			),
		);

		// Si el usuario no existe, lo insertamos
		if (!userOnDb) {
			yield* $(
				Effect.tryPromise(() =>
					db.insert(users).values({
						userId: data.user!.id,
						email: data.user!.email as string,
					}),
				).pipe(
					Effect.catchTag("SqliteError", (err) => {
						// Manejamos el error de restricción de forma segura
						if (err.message.includes("SQLITE_CONSTRAINT")) {
							console.log("User already exists, skipping creation.");
							return Effect.succeed(undefined);
						}
						// Para otros errores, volvemos a lanzar el error
						console.error("An unexpected error occurred:", err);
						return Effect.fail(err);
					}),
				),
			);
		}
	} catch (err: any) {
		// Manejo de errores de Drizzle
		console.error("An unexpected error occurred while processing user:", err);
		// Podrías devolver un Effect.fail aquí si quieres manejarlo en el `match`
	}

	// Si todo es exitoso, devolvemos el JSX a renderizar.
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">
								¡Gracias por registrarte!
							</CardTitle>
							<CardDescription>Revisa tu correo para confirmar</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Te has registrado con éxito. Por favor, revisa tu correo
								electrónico para confirmar tu cuenta antes de iniciar sesión.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}).pipe(
	// Proporcionamos la capa del cliente de Supabase al Effect.
	Effect.provide(createClient),
);

export default async function Page() {
	// Ejecutamos el Effect para obtener el resultado final, que es el JSX a renderizar.
	return await Effect.runPromise(pageLogic);
}
