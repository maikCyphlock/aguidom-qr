import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Dashboard from "@/components/dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function DashboardPage() {
	const data = await getAuthenticatedUser();

	return (
		<Dashboard claims={data.claims} userFromDb={data.userFromDb}>
			<div className="flex w-full min-h-screen bg-muted/20">
				<main className="flex-1 p-6">
					<h1 className="text-2xl font-bold mb-6">Dashboard</h1>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card className="col-span-1 md:col-span-2">
							<CardHeader className="border-b pb-4">
								<CardTitle className="text-xl font-bold">
									Perfil de usuario
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									Información básica de tu cuenta
								</p>
							</CardHeader>
							<CardContent className="mt-6 grid gap-4">
								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<Avatar className="h-10 w-10">
										<AvatarImage src={data.claims.user_metadata.avatar_url} />
										<AvatarFallback>
											{data.userFromDb?.name?.[0] || "U"}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="text-xs text-muted-foreground">Nombre</p>
										<p className="font-medium">{data.userFromDb?.name}</p>
									</div>
								</div>

								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
										📧
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Email</p>
										<p className="font-medium">{data.userFromDb?.email}</p>
									</div>
								</div>

								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
										🆔
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Cédula</p>
										<p className="font-medium">{data.userFromDb?.idNumber}</p>
									</div>
								</div>

								<div className="grid grid-cols-[auto_1fr] items-center gap-4 p-3 rounded-lg border bg-muted/30">
									<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
										📞
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Teléfono</p>
										<p className="font-medium">
											{data.userFromDb?.phone || "No registrado"}
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
