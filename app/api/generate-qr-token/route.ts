import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { db } from "@/lib/db/index";
import { users, qrTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(request: NextRequest) {
	if (!SECRET_KEY || SECRET_KEY.length < 32) {
		return NextResponse.json(
			{ error: "Invalid server config" },
			{ status: 500 },
		);
	}

	try {
		const supabase = await createSupabaseServerClient();
		const { data: sessionData, error: sessionError } =
			await supabase.auth.getClaims();

		if (sessionError || !sessionData?.claims) {
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}

		const email = sessionData.claims.email as string | undefined;
		if (!email) {
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}

		const usersResult = await db
			.select()
			.from(users)
			.where(and(eq(users.email, email), eq(users.role, "admin")));

		if (usersResult.length === 0) {
			return NextResponse.json(
				{ error: "You don't have permissions to generate a QR token" },
				{ status: 403 },
			);
		}

		const user = usersResult[0];
		const now = Math.floor(Date.now() / 1000);
		const payload = {
			clubId: user.clubId,
			iat: now,
			exp: now + 300,
		};

		try {
			const secret = new TextEncoder().encode(SECRET_KEY);
			const token = await new SignJWT(payload)
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt(now)
				.setExpirationTime(payload.exp)
				.sign(secret);

			const id = crypto.randomUUID();
			await db.insert(qrTokens).values({
				id,
				token,
				clubId: user.clubId,
				scannedAt: null,
			});

			return NextResponse.json({ token, expiresAt: payload.exp });
		} catch (err) {
			console.error("Error al firmar o guardar JWT:", err);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	} catch (err) {
		console.error("Unhandled error in generate-qr-token:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
