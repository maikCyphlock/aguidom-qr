import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { db } from "@/lib/db/index";
import { users, qrTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { Effect, Cause, Option } from "effect";
import { createClient, SupabaseClient } from "@/lib/supabase/server";

const SECRET_KEY = process.env.JWT_SECRET_KEY!;

const generateQrTokenEffect = Effect.gen(function* ($) {
  // Verificación de la configuración de forma segura con Effect-TS
  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    yield* $(Effect.fail("INVALID_CONFIG"));
  }

  // Obtenemos el cliente de Supabase desde la capa de inyección
  const supabase = yield* $(SupabaseClient);
  
  // Obtenemos los claims de forma segura
  const { data: sessionData, error: sessionError } = yield* $(
    Effect.tryPromise({
      try: () => supabase.auth.getClaims(),
      catch: (err) => {
        console.error("Error al obtener claims:", err);
        return "DB_ERROR";
      },
    })
  );

  // Verificamos si el usuario está logueado
  if (sessionError || !sessionData?.claims) {
    yield* $(Effect.fail("USER_NOT_LOGGED_IN"));
  }

  const email = sessionData.claims.email;
  if (!email) {
    yield* $(Effect.fail("USER_NOT_LOGGED_IN"));
  }

  // Buscamos el usuario en la base de datos
  const usersResult = yield* $(
    Effect.tryPromise({
      try: () => db.select().from(users).where(
        and(
          eq(users.email, email),
          eq(users.role, "admin")
        )
      ),
      catch: (err) => {
        console.error("Error al buscar usuario:", err);
        return "DB_ERROR";
      },
    })
  );

  // Verificamos si el usuario tiene permisos de administrador
  if (usersResult.length === 0) {
    yield* $(Effect.fail("PERMISSION_DENIED"));
  }

  const user = usersResult[0];
  const now = Math.floor(Date.now() / 1000);

  // Creamos el payload del JWT
  const payload = {
    clubId: user.clubId,
    iat: now,
    exp: now + 300, // 5 minutos de expiración
  };

  // Firmamos el JWT
  const secret = new TextEncoder().encode(SECRET_KEY);
  const token = yield* $(
    Effect.tryPromise({
      try: () => new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(now)
        .setExpirationTime(payload.exp)
        .sign(secret),
      catch: (err) => {
        console.error("Error al firmar JWT:", err);
        return "JWT_SIGN_ERROR";
      },
    })
  );

  // Guardamos el token en la base de datos
  const id = crypto.randomUUID();
  yield* $(
    Effect.tryPromise({
      try: () => db.insert(qrTokens).values({
        id,
        token,
        clubId: user.clubId,
        scannedAt: null,
      }),
      catch: (err) => {
        console.error("Error al guardar token:", err);
        return "DB_ERROR";
      },
    })
  );
  
  // Devolvemos el token y la fecha de expiración
  return NextResponse.json({ token, expiresAt: payload.exp });
});

export async function POST(request: NextRequest) {
  const program = generateQrTokenEffect.pipe(
    // Proporcionamos el cliente de Supabase al efecto
    Effect.provide(createClient),
    // Manejamos los errores específicos y los mapeamos a respuestas de Next.js
    Effect.match({
      onFailure: (error) => {
        if (error === "USER_NOT_LOGGED_IN") {
          return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        if (error === "PERMISSION_DENIED") {
          return NextResponse.json({ error: "You don't have permissions to generate a QR token" }, { status: 403 });
        }
        if (error === "INVALID_CONFIG") {
          return NextResponse.json({ error: "Invalid server config" }, { status: 500 });
        }
        if (error === "DB_ERROR") {
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
        if (error === "JWT_SIGN_ERROR") {
          return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
        
        // Manejo genérico de otros errores
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      },
      onSuccess: (response) => response,
    })
  );

  return await Effect.runPromise(program);
}
