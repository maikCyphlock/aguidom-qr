import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/** Extrae mensaje raíz de errores anidados (defensivo para logs/inspección) */
function getRootErrorMessage(err: unknown): string | undefined {
	try {
		if (!err) return undefined;
		const seen = new Set<any>();
		const walk = (x: any): string | undefined => {
			if (!x || typeof x !== "object")
				return typeof x === "string" ? x : undefined;
			if (seen.has(x)) return undefined;
			seen.add(x);
			if (typeof x.message === "string") return x.message;
			if (x.cause) {
				const m = walk(x.cause);
				if (m) return m;
			}
			for (const k of Object.getOwnPropertyNames(x)) {
				if (
					k.toLowerCase().includes("cause") ||
					k.toLowerCase().includes("error")
				) {
					const m = walk(x[k]);
					if (m) return m;
				}
			}
			try {
				const s = String(x);
				if (s && s !== "[object Object]") return s;
			} catch {}
			return undefined;
		};
		return walk(err);
	} catch {
		return undefined;
	}
}

/** Actualiza el perfil en DB */
async function updateProfile(
	userId: string,
	name: string,
	idNumber: string,
	phone?: string,
) {
	try {
		await db
			.update(users)
			.set({
				name,
				idNumber,
				phone,
				updatedAt: new Date(),
			})
			.where(eq(users.userId, userId));
	} catch (err) {
		console.error("[updateProfile] internal error:", err);
		const root = getRootErrorMessage(err) ?? "";
		if (
			root.includes("UNIQUE constraint failed") &&
			root.includes("users.id_number")
		) {
			throw new Error("ID_NUMBER_CONFLICT");
		}
		throw new Error("DB_ERROR");
	}
}

export async function POST(req: NextRequest) {
	// parseo defensivo
	let ds: any;
	try {
		ds = await req.json();
	} catch {
		return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
	}

	const { name, idNumber, phone } = ds ?? {};
	if (!name || !idNumber) {
		return NextResponse.json(
			{ error: "Name and ID Number are required" },
			{ status: 400 },
		);
	}

	try {
		const supabase = await createSupabaseServerClient();
		await supabase.auth.getSession();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			console.error("[getUser] internal error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}

		if (!user) {
			return NextResponse.json(
				{ error: "User not logged in" },
				{ status: 401 },
			);
		}

		await updateProfile(user.id, name, idNumber, phone);

		return NextResponse.json({ message: "Profile updated successfully" });
	} catch (cause) {
		console.error("[POST /api/profile] error:", cause);
		const root = getRootErrorMessage(cause) ?? "";

		if (root.includes("ID_NUMBER_CONFLICT")) {
			return NextResponse.json(
				{ error: "El número de identificación ya está en uso." },
				{ status: 409 },
			);
		}

		if (
			root.includes("CREATE_CLIENT_ERROR") ||
			root.includes("GET_USER_ERROR") ||
			root.includes("DB_ERROR")
		) {
			return NextResponse.json(
				{
					error: "Ha ocurrido un error interno. Intenta nuevamente más tarde.",
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: "Ha ocurrido un error interno. Intenta nuevamente más tarde." },
			{ status: 500 },
		);
	}
}
