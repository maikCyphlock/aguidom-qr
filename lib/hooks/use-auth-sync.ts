import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

const supabase = createClient()

export function useAuthSync() {
  const { user, session, setUser, setSession } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Obtener usuario autenticado inicial de forma segura
    const getInitialUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) return
      if (user) {
        setUser(user)
        setSession((await supabase.auth.getSession()).data.session ?? null)
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      } else {
        setUser(null)
        setSession(null)
        await queryClient.removeQueries({ queryKey: ['user-profile'] })
      }
    }

    getInitialUser()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const { data: { user } } = await supabase.auth.getUser()
        setSession(session)
        if (user) {
          setUser(user)
          await queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        } else {
          setUser(null)
          await queryClient.removeQueries({ queryKey: ['user-profile'] })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, queryClient])

  // React Query maneja refetch en focus/online por configuración de la query

  return { user, session }
}
