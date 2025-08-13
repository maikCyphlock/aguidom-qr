// Configuración de variables de entorno
export const env = {
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  
  // Turso - Solo servidor
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL!,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN!,
}

// Verificar variables requeridas
export function validateEnv() {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN'
  ]
  
  for (const varName of requiredVars) {
    if (!env[varName as keyof typeof env]) {
      throw new Error(`Variable de entorno requerida: ${varName}`)
    }
  }
}

// Solo validar en el servidor
if (typeof window === 'undefined') {
  validateEnv()
}
