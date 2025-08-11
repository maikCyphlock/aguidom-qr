// components/ErrorCatcher.tsx
"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bug, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type FeedbackData = {
	issueType: "error" | "idle";
	message: string;
	userNote?: string;
	errors?: string[]; // errores técnicos acumulados (solo para issueType = "error")
	timestamp: string;
};

export function ErrorCatcher() {
	const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastClickTimeRef = useRef<number>(Date.now());

	// Buffer / control de errores
	const errorBufferRef = useRef<string[]>([]);
	const errorToastVisibleRef = useRef<boolean>(false);
	const lastErrorToastAtRef = useRef<number>(0);

	// Configurables
	const idleTimeLimit = 45 * 1000; // 45s
	const clickFailLimit = 30 * 1000; // 30s sin clics válidos
	const errorSuppressionWindow = 30 * 1000; // 30s: no abrir más toasts de error dentro de este periodo

	// --- Helper para serializar argumentos de console.error ---
	const serializeArg = (arg: any) => {
		if (typeof arg === "string") return arg;
		try {
			return JSON.stringify(arg, (_key, value) =>
				typeof value === "bigint" ? String(value) : value,
			);
		} catch {
			try {
				return String(arg);
			} catch {
				return "<unserializable>";
			}
		}
	};

	// --- Mostrar toast de feedback (usa el buffer para errores) ---
	const showFeedbackToast = (
		friendlyMessage: string,
		payloadBase: Omit<FeedbackData, "timestamp">,
	) => {
		// señalamos que hay un toast visible
		errorToastVisibleRef.current = true;

		let userNote = "";

		toast.custom(
			(t) => (
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
					<div className="flex items-center space-x-3 mb-4">
						{payloadBase.issueType === "error" ? (
							<Bug className="h-6 w-6 text-red-500" />
						) : (
							<Clock className="h-6 w-6 text-yellow-500" />
						)}
						<h4 className="font-bold text-xl text-gray-900 dark:text-white">
							{payloadBase.issueType === "error"
								? "¡Ups! Algo salió mal."
								: "¿Todo va bien?"}
						</h4>
					</div>

					<p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
						{friendlyMessage}
						{payloadBase.issueType === "error" &&
						errorBufferRef.current.length > 1 ? (
							<span>
								{" "}
								Hemos registrado {errorBufferRef.current.length} errores.
							</span>
						) : null}
					</p>

					<Textarea
						placeholder="Describe lo que estabas haciendo..."
						onChange={(e) => (userNote = e.target.value)}
						rows={3}
						className="mb-4"
					/>

					<div className="flex justify-end space-x-2">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => {
								// cerrar y limpiar buffer (el usuario decidió no enviar)
								toast.dismiss(t);
								errorToastVisibleRef.current = false;
								lastErrorToastAtRef.current = Date.now();
								errorBufferRef.current = [];
							}}
						>
							Cerrar
						</Button>

						<Button
							size="sm"
							onClick={() => {
								const finalPayload: FeedbackData = {
									...payloadBase,
									timestamp: new Date().toISOString(),
									userNote,
									errors:
										payloadBase.issueType === "error"
											? [...errorBufferRef.current]
											: undefined,
								};

								// TODO: Enviar `finalPayload` a Turso (o a tu API)
								console.log("📡 Enviando a Turso:", finalPayload);

								// feedback visual y limpieza
								toast.success("¡Gracias por tu ayuda!");
								toast.dismiss(t);
								errorToastVisibleRef.current = false;
								lastErrorToastAtRef.current = Date.now();
								errorBufferRef.current = [];
							}}
						>
							Enviar
						</Button>
					</div>
				</div>
			),
			{ duration: Infinity },
		);
	};

	// --- Interceptar console.error y acumular errores sin spamear toasts ---
	useEffect(() => {
		const originalError = console.error;

		console.error = (...args: any[]) => {
			// Mantener salida en consola (para debugging en dev)
			originalError(...args);

			// Serializamos el error recibido
			const technicalError = args.map((a) => serializeArg(a)).join(" ");

			// Evitar duplicados exactos en el buffer
			const buf = errorBufferRef.current;
			if (!buf.includes(technicalError)) buf.push(technicalError);

			const now = Date.now();
			const timeSinceLastToast = now - lastErrorToastAtRef.current;

			// Si ya hay un toast visible, NO abrimos otro (pero sí seguimos acumulando en el buffer)
			if (errorToastVisibleRef.current) {
				// solo acumular
				return;
			}

			// Si estamos dentro de la ventana de supresión, no mostrar notificación nueva
			if (timeSinceLastToast < errorSuppressionWindow) {
				// no mostrar, pero seguir acumulando
				return;
			}

			// Mostrar notificación amigable (y permitirá enviar todo el buffer)
			showFeedbackToast("Ocurrió un problema, pero ya lo estamos revisando.", {
				issueType: "error",
				message: "Errores detectados en la consola",
			});
		};

		return () => {
			console.error = originalError;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// --- Lógica de inactividad (se mantiene igual que antes) ---
	useEffect(() => {
		const resetIdleTimer = () => {
			if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
			idleTimeoutRef.current = setTimeout(() => {
				const now = Date.now();
				const timeSinceLastClick = now - lastClickTimeRef.current;

				if (timeSinceLastClick > clickFailLimit) {
					// mueve ratón pero no clics válidos
					showFeedbackToast(
						"Notamos que mueves el ratón pero no puedes interactuar. ¿Quieres reportarlo?",
						{
							issueType: "idle",
							message: "Usuario inactivo / interacción fallida",
						},
					);
				} else {
					// totalmente inactivo
					showFeedbackToast(
						"Notamos que llevas un rato sin interactuar. ¿Necesitas ayuda?",
						{
							issueType: "idle",
							message: "Usuario inactivo",
						},
					);
				}
			}, idleTimeLimit);
		};

		const registerClick = () => {
			lastClickTimeRef.current = Date.now();
			resetIdleTimer();
		};

		["mousemove", "keydown", "scroll"].forEach((event) =>
			window.addEventListener(event, resetIdleTimer),
		);
		window.addEventListener("click", registerClick);

		resetIdleTimer(); // inicializa el timer

		return () => {
			["mousemove", "keydown", "scroll"].forEach((event) =>
				window.removeEventListener(event, resetIdleTimer),
			);
			window.removeEventListener("click", registerClick);
			if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}
