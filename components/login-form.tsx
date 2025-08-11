"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
	<svg
		width="256"
		height="262"
		viewBox="0 0 256 262"
		xmlns="http://www.w3.org/2000/svg"
		preserveAspectRatio="xMidYMid"
		{...props}
	>
		<path
			d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
			fill="#4285F4"
		/>
		<path
			d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
			fill="#34A853"
		/>
		<path
			d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
			fill="#FBBC05"
		/>
		<path
			d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
			fill="#EB4335"
		/>
	</svg>
);

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [form, setForm] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const cardRef = useRef<HTMLDivElement>(null);

	const supabase = createClient();

	const navigateTo = (url: string) => {
		router.push(url);
	};

	const handleChange =
		(field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm({ ...form, [field]: e.target.value });

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithPassword(form);
		if (error) {
			setError(error.message);
			setIsLoading(false);
			return;
		}
		navigateTo("/");
	};

	const handleGoogleSignIn = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${window.location.origin}/auth/callback` },
		});

		if (error) {
			setError(error.message || "Ocurrió un error con Google");
			setIsLoading(false);
		}
	};

	return (
		<div
			className={cn(
				"flex min-h-screen items-center justify-center px-4",
				className,
			)}
			{...props}
		>
			<Card ref={cardRef} className="w-full max-w-sm shadow-lg">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Iniciar Sesión
					</CardTitle>
					<CardDescription className="text-center">
						Ingresa tus credenciales para continuar
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Correo electrónico</Label>
							<Input
								id="email"
								type="email"
								placeholder="tucorreo@ejemplo.com"
								required
								value={form.email}
								onChange={handleChange("email")}
							/>
						</div>

						<div className="grid gap-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Contraseña</Label>
								<a
									onClick={() => navigateTo("/auth/forgot-password")}
									className="text-sm text-muted-foreground hover:underline cursor-pointer"
								>
									¿Olvidaste tu contraseña?
								</a>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									required
									value={form.password}
									onChange={handleChange("password")}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-500 text-center">{error}</p>
						)}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Ingresando..." : "Ingresar"}
						</Button>
					</form>

					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								O continuar con
							</span>
						</div>
					</div>

					<Button
						variant="outline"
						className="w-full"
						onClick={handleGoogleSignIn}
						disabled={isLoading}
					>
						<GoogleIcon className="mr-2 h-5 w-5" />
						Google
					</Button>

					<p className="mt-4 text-sm text-center text-muted-foreground">
						¿No tienes cuenta?{" "}
						<a
							href="/auth/sign-up"
							className="text-primary hover:underline cursor-pointer"
						>
							Regístrate
						</a>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
