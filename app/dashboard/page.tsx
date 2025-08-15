"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Dashboard from "@/components/dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores";

export default function DashboardPage() {
	const { user } = useAuthStore();

	return (
		<Dashboard>
			<div className="flex w-full min-h-screen bg-muted/20">
				<main className="flex-1 p-4 sm:p-6">
					<h1 className="text-xl sm:text-2xl font-bold mb-6">Mi perfil</h1>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card className="lg:col-span-2">
							<CardHeader className="border-b pb-4">
								<CardTitle className="text-lg sm:text-xl font-bold">
									Perfil de usuario
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									Información básica de tu cuenta
								</p>
							</CardHeader>
							<CardContent className="mt-6 grid gap-4">
								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<Avatar className="h-10 w-10">
										<AvatarImage src={user?.user_metadata?.avatar_url} />
										<AvatarFallback>
											{user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="text-xs text-muted-foreground">Nombre</p>
										<p className="font-medium truncate">
											{user?.user_metadata?.full_name || "Usuario"}
										</p>
									</div>
								</div>

								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
										📧
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Email</p>
										<p className="font-medium truncate">{user?.email}</p>
									</div>
								</div>

								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
										🆔
									</div>
									<div>
										<p className="text-xs text-muted-foreground">ID de Usuario</p>
										<p className="font-medium truncate">{user?.id || "No disponible"}</p>
									</div>
								</div>

								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 flex-shrink-0">
										📅
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Miembro desde</p>
										<p className="font-medium">
											{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "No disponible"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Actividad reciente</CardTitle>
							</CardHeader>
							<CardContent>
								<p>No hay actividad reciente.</p>
							</CardContent>
						</Card>
					</div>
				</main>
			</div>
		</Dashboard>
	);
}
