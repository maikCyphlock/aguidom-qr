import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/config/env";

// Esta configuración solo debe usarse en el servidor
export const db = drizzle({
	connection: {
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN,
	},
});

// Función para verificar si estamos en el servidor
export const isServer = typeof window === 'undefined'

// Solo exportar la base de datos si estamos en el servidor
export const getServerDb = () => {
  if (!isServer) {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  return db
}
