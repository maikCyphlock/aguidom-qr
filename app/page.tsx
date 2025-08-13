// app/page.tsx
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, QrCode, Users } from "lucide-react";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema";

import Image from 'next/image';

export default async function Home() {
	const Clubs = await db.select().from(clubs);

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Header */}
		
			<header className="container mx-auto px-4 py-6 flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Image
						src="/clubAguidom.png"
						alt="Club Aguidom Logo"
						width={64}
						height={64}
						className="h-16 w-auto"
					/>
				</div>
				<nav className="hidden md:flex space-x-8">
					<a href="#features" className="hover:underline">
						Características
					</a>
					<a href="#clubs" className="hover:underline">
						Clubes
					</a>
					<a href="#contact" className="hover:underline">
						Contacto
					</a>
				</nav>
				<Button asChild variant="outline">
					<a href="/auth/login">Acceder</a>
				</Button>
			</header>

			<main>
				{/* Hero Section */}
				<section className="container mx-auto px-4 py-16 md:py-24 text-center">
					<Badge variant="outline">Sistema Oficial de Asistencias</Badge>
					<h1 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto mb-6">
						Gestión de Asistencias por Código QR para Clubes
					</h1>
					<p className="text-lg max-w-2xl mx-auto mb-10">
						Registro eficiente y seguro de asistencias en el estadio mediante
						códigos QR. Control total de miembros por clubes afiliados al Club
						Aguidom.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Button className="">Comenzar ahora</Button>
						<Button variant="outline" className="">
							Ver demo
						</Button>
					</div>
				</section>

				{/* Features Section */}
				<section id="features" className="container mx-auto px-4 py-16">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
						<p className="max-w-2xl mx-auto">
							Un sistema simple y eficaz para gestionar el acceso al estadio
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="">
							<CardHeader>
								<QrCode className="w-10 h-10 mb-4 text-foreground" />
								<CardTitle>Generación de QR</CardTitle>
							</CardHeader>
							<CardContent>
								<p>
									Cada miembro recibe un código QR único vinculado a su perfil y
									club
								</p>
							</CardContent>
						</Card>

						<Card className="">
							<CardHeader>
								<CheckCircle className="w-10 h-10 mb-4 text-foreground" />
								<CardTitle>Registro de Asistencia</CardTitle>
							</CardHeader>
							<CardContent>
								<p>
									Escaneo rápido en puertas de acceso para registrar entrada al
									estadio
								</p>
							</CardContent>
						</Card>

						<Card className="">
							<CardHeader>
								<Users className="w-10 h-10 mb-4 text-foreground" />
								<CardTitle>Gestión de Miembros</CardTitle>
							</CardHeader>
							<CardContent>
								<p>
									Panel administrativo para gestionar miembros por clubes
									afiliados
								</p>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Clubs Section */}
				<section id="clubs" className="container mx-auto px-4 py-16">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4">Clubes Afiliados</h2>
						<p className="max-w-2xl mx-auto">
							Gestiona múltiples clubes con acceso centralizado al sistema
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{Clubs.map((club) => (
							<div key={club.id} className="flex flex-col items-center">
								<div className="w-32 h-32 bg-muted rounded-full mb-4 flex items-center justify-center">
									<span className="font-bold text-foreground">{club.name}</span>
								</div>
								<span className="font-medium text-foreground">
									{club.location || "Sin ubicación"}
								</span>
							</div>
						))}
					</div>
				</section>

				{/* CTA Section */}
				<section className="container mx-auto px-4 py-16 text-center">
					<Card className=" max-w-3xl mx-auto">
						<CardHeader>
							<CardTitle className="text-2xl">¿Listo para comenzar?</CardTitle>
							<CardDescription>
								Únete al sistema oficial de asistencias del Club Aguidom
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Button>Registrar mi club</Button>
								<Button variant="outline">Solicitar demo</Button>
							</div>
						</CardContent>
					</Card>
				</section>
			</main>

			{/* Footer */}
			<footer id="contact" className="border-t border-border py-12">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="mb-6 md:mb-0">
							<div className="flex items-center space-x-2">
								<Image
									src="/clubAguidom-claro.png"
									alt="Club Aguidom Logo"
									width={64}
									height={64}
									className="h-16 w-auto"
								/>
							</div>
							<p className="mt-2 text-sm text-muted-foreground">
								Sistema oficial de registro de asistencias
							</p>
						</div>
						<div className="flex space-x-6">
							<button type="button" className="hover:text-foreground">
								Términos
							</button>
							<button type="button" className="hover:text-foreground">
								Privacidad
							</button>
							<button type="button" className="hover:text-foreground">
								Contacto
							</button>
						</div>
					</div>
					<Separator className="my-8 bg-border" />
					<div className="text-center text-muted-foreground text-sm">
						{new Date().getFullYear()} Club Aguidom. Todos los derechos
						reservados.
					</div>
				</div>
			</footer>
		</div>
	);
}
