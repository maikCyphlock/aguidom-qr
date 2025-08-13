import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { email, name, idNumber } = await request.json();
		
		if (!email || !name) {
			return NextResponse.json(
				{ error: "Email y nombre son requeridos" },
				{ status: 400 }
			);
		}

		// Usar Supabase solo para autenticación
		const supabase = await createSupabaseServerClient();
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json(
				{ error: "Usuario no autenticado" },
				{ status: 401 }
			);
		}

		// Usar Drizzle con Turso para actualizar el usuario
		await db
			.update(users)
			.set({ 
				name,
				updatedAt: new Date(),
				idNumber:idNumber || null
			})
			.where(eq(users.email, email));	

		return NextResponse.json({ success: true });

	} catch (error) {
		console.error("[POST /api/profile] error:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 }
		);
	}
}
