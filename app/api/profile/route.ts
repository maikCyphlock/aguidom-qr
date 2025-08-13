import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { DrizzleError, DrizzleQueryError, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import zod from "zod";

class SuccesProfile {
    success: boolean;
    message: string;

    constructor(message: string) {
        this.success = true;
        this.message = message;
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
        };
    }
}

const profileSchema = zod.object({
    name: zod.string().min(1, "El nombre no puede estar vacío").max(100, "El nombre es  demasiado largo").describe("Nombre completo"),
    idNumber: zod.string().min(4, "El número de identificación debe tener al menos 4 caracteres").max(100, "El número de identificación es demasiado largo").describe("Número de identificación"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validar el cuerpo de la solicitud con Zod
        const validation = profileSchema.safeParse(body);

        if (!validation.success) {
            // Si la validación falla, Zod proporciona un objeto de error detallado
            return NextResponse.json(
                { error: "Datos de perfil inválidos", details: validation.error.issues.map((issue) => issue.message).join(", ") },
                { status: 400 }
            );
        }

        const { name, idNumber } = validation.data;

        // 2. Usar Supabase para autenticación
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Usuario no autenticado" },
                { status: 401 }
            );
        }
        if (!user.email) {
            return NextResponse.json(
                { error: "Email del usuario no encontrado" },
                { status: 400 }
            );
        }

        // 3. Usar Drizzle con Turso para actualizar el usuario
        await db
            .update(users)
            .set({
                name,
                updatedAt: new Date(),
                idNumber: idNumber || null
            })
            .where(eq(users.email, user.email));

        return NextResponse.json(
            new SuccesProfile("Perfil actualizado correctamente")
        );

    } catch (error) {
        // Manejar específicamente el error de restricción UNIQUE de Drizzle/Turso
        // La causa original del error se encuentra en el objeto 'cause'
        // @ts-expect-error drizzle query error no tiene el atributo code tipado
        
        if (error instanceof DrizzleQueryError && 'code' in (error.cause || {}) && error?.cause?.code === 'SQLITE_CONSTRAINT') {
            return NextResponse.json(
                { error: "El número de identificación ya existe, por favor use otro." },
                { status: 409 } // 409 Conflict es un código de estado más preciso para esta situación
            );
        }
     // @ts-expect-error drizzle query error no tiene el atributo code tipado
        if (error instanceof DrizzleQueryError && 'code' in (error.cause || {}) && error?.cause?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
            return NextResponse.json(
                { error: "El email ya está asociado a otro usuario." },
                { status: 409 } // 409 Conflict es un código de estado más preciso para esta situación
            );
        }

        // Manejar otros errores de Drizzle
        if (error instanceof DrizzleError) {
            console.error("Error de Drizzle:", error.message);
            return NextResponse.json({ error: "Error en la base de datos." }, { status: 500 });
        }

        // Manejar errores de JSON, etc.
        if (error instanceof Error) {
            console.error("Error genérico:", error.message);
            return NextResponse.json({ error: `Error inesperado: ${error.message}` }, { status: 500 });
        }

        // Error de último recurso
        return NextResponse.json({ error: "Ocurrió un error inesperado" }, { status: 500 });
    }
}
