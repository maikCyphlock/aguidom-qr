import { clubs, users } from '@/lib/db/schema'
import { db } from '@/lib/db'
import zod from 'zod'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const Clubschema = zod.object({
    name: zod.string().min(1, 'El nombre no puede estar vacío').max(100, 'El nombre es demasiado largo').describe('Nombre completo'),
    location: zod.string().min(1, 'la localizacion no puede estar vacia').max(100, 'la localizacion es demasiado larga').describe('Localizacion completa'),
    description: zod.string().min(1, 'la descripcion no puede estar vacia').max(100, 'la descripcion es demasiado larga').describe('Descripcion completa'),
})


export async function POST(request: NextRequest) {
    try {
        // Autenticar al usuario
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        const body = await request.json()
        const { name, location, description } = body

        // Validar el cuerpo de la solicitud con Zod
        const validation = Clubschema.safeParse(body)

        if (!validation.success) {
            // Si la validación falla, Zod proporciona un objeto de error detallado
            return NextResponse.json(
                { error: 'Datos de club inválidos', details: validation.error.issues.map((issue) => issue.message).join(', ') },
                { status: 400 }
            )
        }

        // Obtener el usuario de la base de datos para obtener su userId
        const userFromDb = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email as string))
            .execute();

        if (!userFromDb || userFromDb.length === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const result = await db
            .insert(clubs)
            .values({
                id: nanoid(),
                name,
                location,
                description,
                ownerId: userFromDb[0].userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning()
            
        
        

        // Asignar el clubId al usuario que creó el club
        if(typeof  result === 'undefined'){
            return NextResponse.json(
                { error: 'Error al crear el club' },
                { status: 400 }
            );
        }
     
      
        await db
            .update(users)
            .set({ clubId:  users.clubId })
            .where(eq(users.userId, userFromDb[0].userId))
            .execute();

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
    catch (error) {
        console.error('Error obteniendo perfil del usuario:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

// Obtener el club del usuario autenticado
export async function GET() {
    try {
        // Autenticar al usuario
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        // Obtener el usuario de la base de datos
        const userFromDb = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email as string))
            .execute();

        if (!userFromDb || userFromDb.length === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Si el usuario no tiene club, retornar error
        if (!userFromDb[0].clubId) {
            return NextResponse.json(
                { error: 'Usuario no tiene club asignado' },
                { status: 404 }
            );
        }

        // Obtener la información del club
        const club = await db
            .select()
            .from(clubs)
            .where(eq(clubs.id, userFromDb[0].clubId))
            .execute();

        if (!club || club.length === 0) {
            return NextResponse.json(
                { error: 'Club no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(club[0], { status: 200 });
    } catch (error) {
        console.error('Error al obtener el club:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}