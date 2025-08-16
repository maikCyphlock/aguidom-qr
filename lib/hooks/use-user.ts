import { useAuthStore } from '@/lib/stores/authStore'
import type { AuthenticatedUser } from '@/types/auth'
import { useUserProfileQuery } from '@/lib/hooks/use-user-profile-query'

export function useUser() {
  const { user } = useAuthStore()
  const { data: userProfile, isLoading, error } = useUserProfileQuery()

  // Usuario autenticado con perfil completo
  const authenticatedUser: AuthenticatedUser | null = user && userProfile 
    ? { auth: user, profile: userProfile }
    : null

  // Verificar si el usuario está completamente autenticado
  const isAuthenticated = !!authenticatedUser

  // Verificar si el usuario es admin
  const isAdmin = userProfile?.role === 'admin'

  // Verificar si el usuario pertenece a un club específico
  const belongsToClub = (clubId: string) => userProfile?.clubId === clubId

  return {
    // Datos básicos
    user,
    userProfile,
    authenticatedUser,
    
    // Estados
    isLoading,
    error,
    isAuthenticated,
    
    // Permisos
    isAdmin,
    belongsToClub,
    
    // Funciones de utilidad
    hasRole: (role: string) => userProfile?.role === role,
    getClubId: () => userProfile?.clubId,
    getName: () => userProfile?.name || user?.email || 'Usuario',
  }
}
