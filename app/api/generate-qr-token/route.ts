import { type NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { db } from "@/lib/db/index";
import { users, qrTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ErrorUnauthorized,
  ErrorForbidden,
  ErrorInternalServer,
} from "../Error";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST() {
  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    const err = new ErrorInternalServer("Invalid server config", {
      secretLength: SECRET_KEY?.length,
    });
    return NextResponse.json(err.toJSON(), { status: err.status });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getClaims();

    if (sessionError || !sessionData?.claims) {
      const err = new ErrorUnauthorized("No session found");
      return NextResponse.json(err.toJSON(), { status: err.status });
    }

    const email = sessionData.claims.email as string | undefined;
    if (!email) {
      const err = new ErrorUnauthorized("Email not found in session claims");
      return NextResponse.json(err.toJSON(), { status: err.status });
    }

    const usersResult = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.role, "admin")));

    if (usersResult.length === 0) {
      const err = new ErrorForbidden(
        "You don't have permissions to generate a QR token",
        { email }
      );
      return NextResponse.json(err.toJSON(), { status: err.status });
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
    } catch (err: unknown) {
      console.error("Error al firmar o guardar JWT:", err);
      const error = new ErrorInternalServer("Failed to sign or store JWT", {
        originalError: err,
      });
      return NextResponse.json(error.toJSON(), { status: error.status });
    }
  } catch (err: unknown) {
    console.error("Unhandled error in generate-qr-token:", err);
    const error = new ErrorInternalServer("Unhandled server error", {
      originalError: err,
    });
    return NextResponse.json(error.toJSON(), { status: error.status });
  }
}
