import type { Session, User } from '@supabase/supabase-js'

// Tipo extendido que incluye datos de Supabase y Turso
export interface UserProfile {
  userId: string
  idNumber: string | null
  name: string | null
  email: string
  phone: string | null
  clubId: string | null
  role: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

// Tipo combinado para el estado de autenticación
export interface AuthState {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
}

// Tipo para el usuario autenticado con perfil completo
export interface AuthenticatedUser {
  auth: User
  profile: UserProfile
}
