import { jwtVerify } from "jose";
import { jwtPayloadSchema } from "../validation/schemas";
import { QRError } from "../errors/qr-errors";

export async function verifyJWT(token: string) {
	const SECRET_KEY = process.env.JWT_SECRET_KEY;
	if (!SECRET_KEY || SECRET_KEY.length < 32) {
		throw new QRError(
			"Configuración inválida: JWT_SECRET_KEY no está configurada correctamente",
			500,
		);
	}

	try {
		const secret = new TextEncoder().encode(SECRET_KEY);
		const { payload } = await jwtVerify(token, secret, {
			algorithms: ["HS256"],
			clockTolerance: 15,
		});

		return jwtPayloadSchema.parse(payload);
	} catch (err: unknown) {
		const e = err as { code?: string };
		if (e.code === "ERR_JWT_EXPIRED") {
			throw new QRError("El token ha expirado", 401);
		}
		if (e.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
			throw new QRError("La firma del token es inválida", 401);
		}
		throw new QRError("Token inválido", 400);
	}
}
