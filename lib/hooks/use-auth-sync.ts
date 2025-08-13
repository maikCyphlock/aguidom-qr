import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useAuthSync() {
  const { user, session, syncUserProfile, setUser, setSession } = useAuthStore()

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        setUser(session.user)
        // Sincronizar perfil del usuario
        if (session.user.email) {
          await syncUserProfile(session.user.email)
        }
      }
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user?.email) {
          await syncUserProfile(session.user.email)
        } else {
          // Limpiar perfil si no hay sesión
          useAuthStore.getState().setUserProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, syncUserProfile])

  return { user, session }
}
