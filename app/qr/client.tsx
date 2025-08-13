// src/app/generator/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode } from "lucide-react";
import QRCode from "react-qr-code";

export default function QRGeneratorPage({
	club,
}: {
	club: {
		id: string;
		name: string;
	};
}) {
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [expiresAt, setExpiresAt] = useState<number | null>(null);

	const generateQRCode = async () => {
		setLoading(true);
		setError(null);
		setSuccess(null);
		setQrCode(null);
		setExpiresAt(null);

		try {
			const response = await fetch("/api/generate-qr-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					clubId: club?.id,
				}),
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				const text = await response.text();
				throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}`);
			}

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Error en el servidor");
			}

			setQrCode(data.token);
			setExpiresAt(data.expiresAt);
			setSuccess("Código QR generado exitosamente!");
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('Error generating QR token:', error);
				setError(error?.message || "Error al generar el código QR");
			} else {
				console.error('Error generating QR token:', error);
				setError("Error al generar el código QR");
			}
			
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid place-content-center min-h-screen">
			<Card className="w-full max-w-md mx-auto dark:bg-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-zinc-900">
						<QrCode className="w-5 h-5" />
						Generador de Código QR
					</CardTitle>
					<CardDescription className="text-zinc-600">
						Genera códigos QR para {club?.name} con validez de 5 minutos
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{error && (
						<Alert
							variant="destructive"
							className="border-red-500 text-red-700"
						>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert className="border-green-500 text-green-700">
							<AlertDescription>{success}</AlertDescription>
						</Alert>
					)}

					<Button
						onClick={generateQRCode}
						disabled={loading}
						className="w-full bg-black text-white hover:bg-gray-800"
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Generando...
							</>
						) : (
							<p className="text-zinc-200 font-normal">
								Generar Código{" "}
								<span className="text-zinc-100 font-bold">QR</span>
							</p>
						)}
					</Button>

					{qrCode && (
						<div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
							<QRCode
								value={qrCode}
								size={200}
								className="w-full h-auto max-w-[200px]"
							/>
							{expiresAt && (
								<p className="mt-2 text-sm text-zinc-500">
									Expira en: {new Date(expiresAt * 1000).toLocaleTimeString()}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
