import { z } from "zod";

export const requestSchema = z.object({
  token: z.string().min(1, "Token inválido"),
});

export const jwtPayloadSchema = z.object({
  clubId: z.string(),
});
