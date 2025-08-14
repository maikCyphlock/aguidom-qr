// Importa las dependencias necesarias
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Obtiene el usuario autenticado y su perfil de la base de datos.
 * Redirige a la página de inicio de sesión si el usuario no está autenticado o si el perfil no se encuentra.
 * @returns El objeto de usuario autenticado.
 */
export async function getAuthenticatedUserFromServer() {
    // 1. Crear el cliente de Supabase para el servidor
    const supabase = await createSupabaseServerClient();
    
    // 2. Obtener el usuario de Supabase
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    // 3. Redirigir si hay un error de autenticación o si no hay usuario
    if (error || !user) {
        redirect("/auth/login");
    }

    // 4. Buscar el perfil del usuario en la base de datos Drizzle
    const userFromDb = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email as string))
        .get();

    // 5. Redirigir si el perfil no se encuentra en la base de datos
    // Esto actúa como una medida de seguridad adicional.
    if (!userFromDb) {
        redirect("/auth/login");
    }

    // 6. Retornar el usuario de la base de datos si todo es correcto
    return {userFromDb,user};
}
