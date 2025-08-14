// components/ErrorCatcher.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { Bug, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

// El tipo de dato no cambia
type FeedbackData = {
    issueType: "error" | "idle";
    message: string;
    userNote?: string;
    errors?: string[];
    timestamp: string;
};

// FIX: Creamos un componente interno para el contenido del toast
// Esto resuelve el problema de la captura del estado del <Textarea>
function FeedbackToastContent({
    toastId,
    payloadBase,
    friendlyMessage,
    errorCount,
}: {
    toastId: string | number;
    payloadBase: Omit<FeedbackData, "timestamp" | "userNote" | "errors">;
    friendlyMessage: string;
    errorCount: number;
}) {
    // FIX: Usamos useState para manejar la nota del usuario de forma controlada
    const [userNote, setUserNote] = useState("");
    const errorBuffer = useRef<string[]>(errorBufferRef.current).current; // Copia del buffer en el momento de la creación

    const handleClose = () => {
        toast.dismiss(toastId);
        errorToastVisibleRef.current = false;
        lastErrorToastAtRef.current = Date.now();
        errorBufferRef.current = [];
    };

    const handleSubmit = () => {
        const finalPayload: FeedbackData = {
            ...payloadBase,
            timestamp: new Date().toISOString(),
            userNote: userNote.trim(),
            errors: payloadBase.issueType === "error" ? [...errorBuffer] : undefined,
        };

        // TODO: Enviar `finalPayload` a Turso (o a tu API)
        console.log("📡 Enviando a Turso:", finalPayload);

        toast.success("¡Gracias por tu ayuda!");
        handleClose();
    };

    return (
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
                {payloadBase.issueType === "error" && errorCount > 1 && (
                    <span> Hemos registrado {errorCount} errores.</span>
                )}
            </p>

            <Textarea
                placeholder="Opcional: describe lo que estabas haciendo..."
                onChange={(e) => setUserNote(e.target.value)}
                value={userNote}
                rows={3}
                className="mb-4"
            />

            <div className="flex justify-end space-x-2">
                <Button size="sm" variant="ghost" onClick={handleClose}>
                    Cerrar
                </Button>
                <Button size="sm" onClick={handleSubmit}>
                    Enviar Reporte
                </Button>
            </div>
        </div>
    );
}


// Refs globales a nivel de módulo para que sean compartidas por el toast y el componente principal
const errorBufferRef = { current: [] as string[] };
const errorToastVisibleRef = { current: false };
const lastErrorToastAtRef = { current: 0 };


export function ErrorCatcher() {
    const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastClickTimeRef = useRef<number>(Date.now());

    // Configurables
    const idleTimeLimit = 90 * 1000; // FIX: Comentario corregido a 90s
    const clickFailLimit = 30 * 1000;
    const errorSuppressionWindow = 30 * 1000;

    const serializeArg = (arg: unknown): string => {
        if (typeof arg === "string") return arg;
        try {
            return JSON.stringify(arg, (_key, value) =>
                typeof value === "bigint" ? String(value) : value,
            );
        } catch {
            return String(arg);
        }
    };

    // FIX: Se envuelve en useCallback para evitar clausuras obsoletas en los useEffect
    const showFeedbackToast = useCallback(
        (
            friendlyMessage: string,
            payloadBase: Omit<FeedbackData, "timestamp" | "userNote" | "errors">,
        ) => {
            errorToastVisibleRef.current = true;

            toast.custom(
                (t) => (
                    <FeedbackToastContent
                        toastId={t}
                        friendlyMessage={friendlyMessage}
                        payloadBase={payloadBase}
                        errorCount={errorBufferRef.current.length}
                    />
                ),
                {
                    duration: Infinity, // FIX: El toast no se cierra automáticamente
                },
            );
        },
        [], // Esta función no tiene dependencias externas, por lo que el array está vacío
    );

    // --- Interceptar console.error y acumular errores sin spamear toasts ---

    useEffect(() => {
        const originalError = console.error;

        console.error = (...args: unknown[]) => {
            originalError(...args);
            const technicalError = args.map((a) => serializeArg(a)).join(" ");
            const buf = errorBufferRef.current;
            if (!buf.includes(technicalError)) buf.push(technicalError);

            const now = Date.now();
            const timeSinceLastToast = now - lastErrorToastAtRef.current;

            if (errorToastVisibleRef.current || timeSinceLastToast < errorSuppressionWindow) {
                return;
            }

            showFeedbackToast("Ocurrió un problema, pero ya lo estamos revisando.", {
                issueType: "error",
                message: "Errores detectados en la consola",
            });
        };

        return () => {
            console.error = originalError;
        };
        // FIX: Añadimos la dependencia a la función memoizada
    }, [showFeedbackToast, errorSuppressionWindow]);

    // --- Lógica de inactividad ---
    useEffect(() => {
        const resetIdleTimer = () => {
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = setTimeout(() => {
                const timeSinceLastClick = Date.now() - lastClickTimeRef.current;
                if (timeSinceLastClick > clickFailLimit) {
                    showFeedbackToast(
                        "Notamos que mueves el cursor pero no puedes interactuar. ¿Quieres reportarlo?",
                        { issueType: "idle", message: "Usuario inactivo / interacción fallida" },
                    );
                } else {
                    showFeedbackToast(
                        "Notamos que llevas un rato sin interactuar. ¿Necesitas ayuda?",
                        { issueType: "idle", message: "Usuario inactivo" },
                    );
                }
            }, idleTimeLimit);
        };

        const registerClick = () => {
            lastClickTimeRef.current = Date.now();
            resetIdleTimer();
        };

        const events = ["mousemove", "keydown", "scroll"];
        events.forEach((event) => window.addEventListener(event, resetIdleTimer));
        window.addEventListener("click", registerClick);

        resetIdleTimer();

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
            window.removeEventListener("click", registerClick);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
        // FIX: Añadimos la dependencia a la función memoizada
    }, [showFeedbackToast]);

    return null;
}