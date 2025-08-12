import Client from "./client";
import { db } from "@/lib/db/index";
import { clubs, users } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Esta es la página principal que obtiene los datos del club y el usuario
 * utilizando la inyección de dependencias de Effect.ts para el cliente de Supabase.
 */
export default async function Page() {
    const supabase = await createSupabaseServerClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getClaims();
    if (sessionError || !sessionData?.claims?.email) {
        return redirect("/auth/login");
    }

    const email = sessionData.claims.email as string;

    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
        throw new Error("No se encontró el usuario en la base de datos");
    }

    if (user.role !== "admin") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-white rounded-lg p-8 shadow">
                    <h2 className="text-2xl text-center">
                        No tienes permisos, consulta con tu profesor
                    </h2>
                </div>
            </div>
        );
    }

    if (!user.clubId) {
        throw new Error(
            "Tu cuenta no está asociada a ningún club. Por favor, contacta al administrador.",
        );
    }

    const club = await db.select().from(clubs).where(eq(clubs.id, user.clubId)).get();
    if (!club) {
        throw new Error(
            "No se pudo encontrar la información del club. Por favor, inténtalo de nuevo más tarde.",
        );
    }

    return <Client club={club} />;
}
