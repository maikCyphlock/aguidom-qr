import type {
	QRVerificationRequest,
	QRVerificationResponse,
} from "../../types/qr-verification";
import { getUserEmail } from "../auth/session";
import { findValidToken, markTokenAsScanned } from "../db/qr-tokens";
import { findUserByEmailAndClub, type User } from "../db/users";
import { verifyJWT } from "../jwt/verify";

export async function verifyQRToken(
	request: QRVerificationRequest,
): Promise<QRVerificationResponse> {
	// 1. Obtener email del usuario autenticado
	const email = await getUserEmail();

	// 2. Verificar JWT y extraer payload
	const payload = await verifyJWT(request.token);

	// 3. Buscar usuario en el club
	const user: User = await findUserByEmailAndClub(email, payload.clubId);

	// 4. Verificar que el token no haya sido escaneado
	await findValidToken(request.token);

	// 5. Marcar token como escaneado
	await markTokenAsScanned(request.token, user.userId);

	return {
		saved: true,
		message: `Bienvenido ${user.name}, has sido verificado y escaneado correctamente`,
		name: user.name,
		club: user.clubId,
	};
}
