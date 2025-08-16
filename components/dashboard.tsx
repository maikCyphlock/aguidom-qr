// components/dashboard.tsx
"use client";

import type React from "react";
import {
	Sidebar,
	SidebarProvider,
	SidebarHeader,
	SidebarFooter,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores";
import Link from "next/link";
import { useUserProfileQuery } from "@/lib/hooks/use-user-profile-query";


export default function DashboardSidebar({
	children,

}: {
	children: React.ReactNode;	
}) {
	const { user, signOut,  } = useAuthStore();
	const {data: profile } = useUserProfileQuery()
	return (
		<SidebarProvider>
			{/* Botón para abrir/cerrar */}
			
			<SidebarTrigger className="m-2" />
			<Sidebar collapsible="icon" >
				
				{/* Header con info de usuario */}
				<SidebarHeader>
					<div className="flex items-center gap-3">
						<Avatar>
							<AvatarImage src={user?.user_metadata?.avatar_url} />
							<AvatarFallback>{user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
						</Avatar>
						<div className="truncate">
							<p className="font-semibold">{user?.user_metadata?.full_name || "Usuario"}</p>
							<p className="text-xs text-muted-foreground truncate">
								{user?.email}
							</p>
						</div>
					</div>
				</SidebarHeader>

				{/* Contenido principal */}
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Menú</SidebarGroupLabel>
						<SidebarGroupContent>
							<Link href="/dashboard/">
								<Button variant="ghost" className="w-full justify-start">
									<User className="w-4 h-4 mr-2" />
									Perfil
								</Button>
							</Link>
							<Link href="/dashboard/settings">
								<Button variant="ghost" className="w-full justify-start">
									<Settings className="w-4 h-4 mr-2" />
									Configuración
								</Button>
							</Link>
							<Link href="/dashboard/attendance">
								<Button variant="ghost" className="w-full justify-start">
									<Calendar className="w-4 h-4 mr-2" />
									Asistencia
								</Button>
							</Link>
							<Link href={`/club/${profile?.clubId || ''}`}>
								<Button variant="ghost" className="w-full justify-start">
									<Calendar className="w-4 h-4 mr-2" />
									Mi club
								</Button>
							</Link>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				{/* Footer con Logout */}
				<SidebarFooter>
					<Button
						type="button"
						variant="destructive"
						className="w-full justify-start"
						onClick={async() => {
							await signOut()
							window.location.reload()
						}}
					>
						<LogOut className="w-4 h-4 mr-2" />
						Cerrar sesión
					</Button>
				</SidebarFooter>
			</Sidebar>
			<div className="px-2 w-full">{children}</div>
		</SidebarProvider>
	);
}
