import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Verificar autenticación
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Buscar perfil del usuario en Turso
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email!))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      )
    }

    const userProfile = result[0]

    return NextResponse.json({
      success: true,
      profile: userProfile,
      headers: {
        // Agregar caché de 20 segundo
        "Cache-Control":   `public, max-age=20`,
        "Expires":         new Date(Date.now() + 20000).toUTCString(),
      },
    })

  } catch (error) {
    console.error('Error obteniendo perfil del usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createSupabaseServerClient()
    const { data: { user }} = await supabase.auth.getUser()
    
    if ( !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, clubId } = body

    // Actualizar perfil del usuario en Turso
    if (!name && !phone && !clubId) {
      return NextResponse.json(
        { error: 'No se proporcionaron datos para actualizar el perfil' },
        { status: 400 }
      )
    }
    if(user.email === undefined){
      return NextResponse.json(
        { error: 'No se puede actualizar el perfil sin email' },
        { status: 400 }
      )
    }

    const result = await db
      .update(users)
      .set({
        name: name || null,
        phone: phone || null,
        clubId: clubId || null,
        updatedAt: new Date()
      })
      .where(eq(users.email, user.email))
      .returning()

    if (typeof result === 'undefined') {  
      return NextResponse.json(
        { error: 'Error actualizando perfil' },
        { status: 500 }
      )
    }

    const updatedProfile = result ?? result[0]

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error actualizando perfil del usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
