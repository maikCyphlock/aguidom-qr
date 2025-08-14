import { jwtVerify } from "jose";
import {
	ErrorBadRequest,
	ErrorInternalServer,
	ErrorUnauthorized,
} from "@/app/api/Error";
import { jwtPayloadSchema } from "../validation/schemas";




export async function verifyJWT(token: string) {
  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  if (!SECRET_KEY || SECRET_KEY.length < 32) {
    throw new ErrorInternalServer(
      "Invalid configuration: JWT_SECRET_KEY is not set correctly"
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
      throw new ErrorUnauthorized("Token has expired");
    }
    if (e.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      throw new ErrorUnauthorized("Token signature is invalid");
    }
    throw new ErrorBadRequest("Invalid token");
  }
}
