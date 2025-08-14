import { clubs, users } from '@/lib/db/schema';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { eq, isNull } from 'drizzle-orm';

// ---
// Ruta para obtener todos los clubes y sus propietarios
export async function GET() {
    try {
        // 1. Autenticar al usuario para asegurar que solo usuarios logueados pueden ver los clubes
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        // 2. obtener todos los usuarios cuyo clubId es nulo
        const usersWithoutClub = await db
            .select()
            .from(users)
            .where(isNull(users.clubId))

        return NextResponse.json(usersWithoutClub, { status: 200 ,
            headers: {
                'Content-Type': 'application/json',
                //cachea
                'Cache-Control': 'public, max-age=600',
    

            },
         } );
    } catch (error) {
        console.error('Error al obtener los clubes:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al obtener los clubes' },
            { status: 500 }
        );
    }
}
// ruta para añadir un usuario a un club
export async function POST(req: NextRequest) {
    try {
        // 1. Autenticar al usuario para asegurar que solo usuarios logueados pueden añadir usuarios a clubes
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            );
        }

        // 2. Obtener los datos de la solicitud
        const { clubId, userId } = await req.json();

        if (!clubId || !userId) {
            return NextResponse.json(
                { error: 'Se requiere clubId y userId' },
                { status: 400 }
            );
        }

        // 3. Verificar que el club existe y que el usuario autenticado es el propietario
        const club = await db.select().from(clubs).where(eq(clubs.id, clubId)).execute();

        if (!club || club.length === 0) {
            return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 });
        }

        // Verificar que el usuario autenticado sea el propietario del club
        const authenticatedUser = await db.select().from(users).where(eq(users.email, user.email as string)).execute();
        
        if (!authenticatedUser || authenticatedUser.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
        }

        if (club[0].ownerId !== authenticatedUser[0].userId) {
            return NextResponse.json({ error: 'No tienes permisos para añadir usuarios a este club' }, { status: 403 });
        }

        // 4. Verificar que el usuario existe y no tiene club
        const userToAdd = await db.select().from(users).where(eq(users.userId, userId)).execute();

        if (!userToAdd || userToAdd.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if (userToAdd[0].clubId) {
            return NextResponse.json({ error: 'El usuario ya pertenece a un club' }, { status: 400 });
        }

        // 5. Actualizar el usuario para asignarlo al club
        await db.update(users)
            .set({ clubId: clubId })
            .where(eq(users.userId, userId))
            .execute();

        return NextResponse.json(
            { message: 'Usuario añadido al club exitosamente' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al añadir usuario al club:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al añadir usuario al club' },
            { status: 500 }
        );
    }
}