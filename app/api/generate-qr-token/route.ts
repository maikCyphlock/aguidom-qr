// src/app/api/generate-qr-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from 'jose';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const SECRET_KEY = process.env.JWT_SECRET_KEY;

  console.log("[POST] /api/generate-qr-token - Inicio de la solicitud");

  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    console.error("[ERROR] Clave secreta no válida o demasiado corta");
    return NextResponse.json(
      { error: "Configuración del servidor inválida: JWT_SECRET_KEY debe tener al menos 32 caracteres" },
      { status: 500 }
    );
  }

  try {
    const { club, name, idNumber, phone } = await request.json();

    console.log("[INFO] Datos recibidos:", { club, name, idNumber, phone });

    // Validaciones
    if (!club || !name || !idNumber || !phone) {
      console.warn("[WARN] Faltan campos obligatorios");
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (idNumber.length < 6) {
      console.warn("[WARN] Cédula demasiado corta");
      return NextResponse.json(
        { error: "La cédula debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (phone.replace(/[^0-9]/g, '').length < 7) {
      console.warn("[WARN] Teléfono inválido");
      return NextResponse.json(
        { error: "El teléfono debe tener al menos 7 dígitos" },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      club,
      name,
      idNumber,
      phone,
      iat: now,
      exp: now + 300 // 5 minutos
    };

    console.log("[INFO] Payload JWT:", payload);

    const secret = new TextEncoder().encode(SECRET_KEY);
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);

    console.log("[INFO] JWT generado");

    const hmac = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(jwt)
      .digest('hex');

    console.log("[INFO] HMAC generado");

    const token = `${jwt}.${hmac}`;
    console.log("[SUCCESS] Token generado con éxito");

    return NextResponse.json({ 
      token,
      expiresAt: payload.exp
    });

  } catch (error: any) {
    console.error("[ERROR] Error en generación de token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor: " + error.message },
      { status: 500 }
    );
  }
}
