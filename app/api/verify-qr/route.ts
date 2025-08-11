// src/app/api/verify-qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(request: NextRequest) {
  console.log("[POST] /api/verify-qr - Inicio de la verificación");

  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    console.error("[ERROR] Clave secreta JWT no definida o demasiado corta");
    return NextResponse.json(
      { valid: false, error: "Configuración del servidor inválida: clave secreta no válida" },
      { status: 500 }
    );
  }

  try {
    const { token } = await request.json();

    console.log("[INFO] Token recibido:", token?.slice(0, 30) + "...");

    // Validar presencia del token
    if (!token || typeof token !== 'string') {
      console.warn("[WARN] Token no proporcionado o inválido");
      return NextResponse.json(
        { valid: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    // Validar formato del token
    const parts = token.split('.');
    if (parts.length !== 3 && parts.length !== 4) {
      console.warn("[WARN] Formato de token inválido:", parts.length, "partes");
      return NextResponse.json(
        { valid: false, error: "Formato de token inválido" },
        { status: 400 }
      );
    }

    const jwtToken = parts.length === 4 
      ? `${parts[0]}.${parts[1]}.${parts[2]}`
      : token;

    const secret = new TextEncoder().encode(SECRET_KEY);

    console.log("[INFO] Verificando firma del token...");

    const { payload } = await jwtVerify(jwtToken, secret, {
      algorithms: ['HS256'],
      clockTolerance: 15, // 15 segundos de margen
    });

    console.log("[INFO] Token verificado con éxito:", payload);

    if (!payload.exp || Date.now() > payload.exp * 1000) {
      console.warn("[WARN] Token expirado");
      return NextResponse.json(
        { valid: false, error: "Token expirado" },
        { status: 401 }
      );
    }

    console.log("[SUCCESS] Token válido para:", payload.name || payload.sub);

    return NextResponse.json({
      valid: true,
      data: {
        name: payload.name,
        id: payload.sub,
        role: payload.role,
        // Agrega otros claims aquí si deseas
      }
    });

  } catch (err: any) {
    console.error("[ERROR] Fallo en la verificación del token:", err);

    const errorMessage = err.code === 'ERR_JWT_EXPIRED'
      ? "Token expirado"
      : err.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED'
        ? "Firma inválida"
        : "Token inválido";

    return NextResponse.json(
      { valid: false, error: errorMessage },
      { status: 401 }
    );
  }
}
