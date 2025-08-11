import React from "react";
import { db } from "@/lib/db/index";
import { qrTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { createClient, SupabaseClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/dashboard";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, QrCode, Clock } from "lucide-react";

// La lógica principal de la página, escrita como un Effect para manejar las dependencias.
const attendancePageLogic = Effect.gen(function* () {
	// Obtiene el cliente de Supabase del contexto de Effect.
	const sb = yield* SupabaseClient;

	// Envuelve la llamada asíncrona de Supabase en Effect.promise.
	const { data } = yield* Effect.promise(() => sb.auth.getUser());

	// Envuelve la llamada asíncrona de Drizzle en Effect.promise.
	const asistencias = yield* Effect.promise(() =>
		db.select().from(qrTokens).where(eq(qrTokens.userId, data.user?.id)),
	);

	// Devuelve los datos necesarios para renderizar el componente.
	return { userFromDb: data.user, claims: data.user, asistencias };
});

async function Page() {
	// Ejecuta la lógica del Effect, proporcionando la capa del cliente de Supabase.
	const { userFromDb, claims, asistencias } = await Effect.runPromise(
		attendancePageLogic.pipe(Effect.provide(createClient)),
	);

	return (
		<DashboardSidebar userFromDb={userFromDb} claims={claims}>
			<div className="space-y-6">
				{/* Encabezado */}
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Mis Registros de Asistencia
					</h1>
					<p className="text-muted-foreground text-sm">
						Aquí podrás ver tus registros de asistencia mediante códigos QR.
					</p>
				</div>

				<Separator />

				{/* Tarjetas de registros */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{asistencias.length > 0 ? (
						asistencias.map((asistencia) => (
							<Card
								key={asistencia.id}
								className="hover:shadow-lg transition-shadow"
							>
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center gap-2 text-lg">
										<QrCode className="w-5 h-5 text-primary" />
										Código QR
									</CardTitle>
									<CardDescription className="truncate">
										Token: {asistencia.token}
									</CardDescription>
								</CardHeader>

								<CardContent className="flex flex-col gap-3">
									<div className="flex items-center gap-2">
										<CalendarDays className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">
											Club:{" "}
											{asistencia.clubId ? (
												<span className="font-medium">{asistencia.clubId}</span>
											) : (
												"No asignado"
											)}
										</span>
									</div>

									<div className="flex items-center justify-between">
										{asistencia.scannedAt ? (
											<Badge
												variant="default"
												className="flex items-center gap-1"
											>
												<Clock className="w-4 h-4" /> Escaneado
											</Badge>
										) : (
											<Badge
												variant="secondary"
												className="flex items-center gap-1"
											>
												<Clock className="w-4 h-4" /> Pendiente
											</Badge>
										)}

										<span className="text-sm text-muted-foreground">
											{asistencia.scannedAt
												? new Date(asistencia.scannedAt).toLocaleString(
														"es-ES",
														{
															day: "2-digit",
															month: "short",
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														},
													)
												: "—"}
										</span>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<div className="col-span-full text-center text-muted-foreground text-sm">
							No tienes asistencias registradas aún.
						</div>
					)}
				</div>
			</div>
		</DashboardSidebar>
	);
}

export default Page;
