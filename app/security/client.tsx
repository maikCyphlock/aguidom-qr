"use client";

import Html5QrcodePlugin from "@/components/Html5QrcodePlugin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { users } from "@/lib/db/schema";

// Definir el tipo para la respuesta de la API de verificación
interface VerificationResult {
	success: boolean;
	message: string;
	participant?: {
		name: string;
		club: string;
	};
}

// Definir el tipo para un usuario de la búsqueda
type UserSearchResult = typeof users.$inferSelect;

export default function SecurityClient() {
	const [isScannerActive, setScannerActive] = useState(false);
	const [verificationResult, setVerificationResult] =
		useState<VerificationResult | null>(null);
	const [manualSearchQuery, setManualSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const handleNewScanResult = async (decodedText: string) => {
		setScannerActive(false);
		setVerificationResult(null);
		try {
			// First verify the QR code
			const verifyResponse = await fetch("/api/verify-qr", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token: decodedText }),
			});

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || "Error al verificar el código QR");
      }

      const userData = await verifyResponse.json();
      
      // Register the stadium entry
      const response = await fetch("/api/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userData.userId,
          description: "Entrada al estadio"
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationResult({
          success: true,
          message: result.message,
          participant: { 
            name: userData.name || result.data.userId, 
            club: userData.club || "Estadio" 
          },
        });
      } else {
        throw new Error(result.error || "Error al registrar la entrada");
      }
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      setVerificationResult({
        success: false,
        message: error instanceof Error ? error.message : "Error de red o del servidor",
      });
    }
  };

	const handleManualSearch = async () => {
		if (!manualSearchQuery.trim()) return;
		setIsSearching(true);
		setSearchResults([]);
		try {
			const response = await fetch(
				`/api/user/search?query=${encodeURIComponent(manualSearchQuery)}`,
			);
			const users = await response.json();
			setSearchResults(users);
		} catch (error) {
			console.error("Error en la búsqueda manual:", error);
		}
		setIsSearching(false);
	};

	const handleManualRegistration = async (userId: string) => {
		try {
			const response = await fetch("/api/security", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
          userId,
          description: "Entrada al estadio"
        }),
			});

      const result = await response.json();
      
      if (response.ok) {
        setVerificationResult({
          success: true,
          message: result.message,
          participant: {
            name: result.data.userId, // We'll update this if we have user info in the response
            club: "Estadio"
          }
        });
      } else {
        setVerificationResult({
          success: false,
          message: result.error || "Error al registrar la entrada"
        });
      }
		} catch (error) {
			console.error("Error al registrar la entrada al estadio:", error);
			setVerificationResult({
				success: false,
				message: "Error de conexión con el servidor",
			});
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto mt-8 p-4">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold">Control de Acceso</h1>
				<p className="text-gray-500">
					Escanee el código QR o busque manualmente al participante.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="p-4 border rounded-lg text-center">
					<h2 className="text-xl font-semibold mb-4">Lector QR</h2>
					{!isScannerActive ? (
						<Button onClick={() => setScannerActive(true)}>Activar Lector</Button>
					) : (
						<>
							<div className="w-full max-w-xs mx-auto">
								<Html5QrcodePlugin
									fps={10}
									disableFlip={false}
									qrCodeSuccessCallback={handleNewScanResult}
								/>
							</div>
							<Button
								variant="destructive"
								className="mt-4"
								onClick={() => setScannerActive(false)}
							>
								Cancelar
							</Button>
						</>
					)}
				</div>

				<div className="p-4 border rounded-lg">
					<h2 className="text-xl font-semibold mb-4">Búsqueda Manual</h2>
					<div className="flex gap-2">
						<Input
							placeholder="Cédula o nombre"
							value={manualSearchQuery}
							onChange={(e) => setManualSearchQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
						/>
						<Button onClick={handleManualSearch} disabled={isSearching}>
							{isSearching ? "Buscando..." : "Buscar"}
						</Button>
					</div>

					<div className="mt-4 space-y-2">
						{searchResults.map((user) => (
							<div
								key={user.userId}
								className="flex justify-between items-center p-2 border rounded"
							>
								<div>
									<p className="font-semibold">{user.name}</p>
									<p className="text-sm text-gray-500">{user.idNumber}</p>
								</div>
								<Button
									size="sm"
									onClick={() => handleManualRegistration(user.userId)}
								>
									Registrar entrada
								</Button>
							</div>
						))}
					</div>
				</div>
			</div>

			{verificationResult && (
				<div
					className={`mt-6 p-4 rounded-lg text-center ${
						verificationResult.success
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					<h3 className="font-bold text-lg">
						{verificationResult.success ? "Verificado" : "Error"}
					</h3>
					<p>{verificationResult.message}</p>
					{verificationResult.participant && (
						<div className="mt-2">
							<p>
								<strong>Nombre:</strong> {verificationResult.participant.name}
							</p>
							<p>
								<strong>Club:</strong> {verificationResult.participant.club}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
