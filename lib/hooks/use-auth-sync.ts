import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useAuthSync() {
  const { user, session, syncUserProfile, refreshUserProfile, setUser, setSession } = useAuthStore()

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
      async (_event, session) => {
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

  // Refrescar al volver al foco/online
  useEffect(() => {
    // Evitar múltiples refresh simultáneos
    const isRefreshingRef = { current: false }
    // Debounce para consolidar múltiples eventos juntos (focus + visibility)
    let debounceId: number | null = null

    const safeRefresh = async () => {
      if (isRefreshingRef.current) return
      isRefreshingRef.current = true
      try {
        await refreshUserProfile()
      } finally {
        isRefreshingRef.current = false
      }
    }

    const scheduleRefresh = () => {
      if (debounceId) {
        window.clearTimeout(debounceId)
      }
      debounceId = window.setTimeout(() => {
        // Solo refrescar si la pestaña está visible
        if (document.visibilityState === 'visible') {
          void safeRefresh()
        }
      }, 300)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleRefresh()
      }
    }

    const handleFocus = () => {
      scheduleRefresh()
    }

    const handleOnline = () => {
      scheduleRefresh()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (debounceId) window.clearTimeout(debounceId)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshUserProfile])

  // Polling ligero para detectar cambios del perfil en background
  useEffect(() => {
    const POLL_INTERVAL_MS = 60000
    let isRefreshing = false
    const intervalId = window.setInterval(async () => {
      if (document.visibilityState !== 'visible') return
      if (isRefreshing) return
      isRefreshing = true
      try {
        await refreshUserProfile()
      } finally {
        isRefreshing = false
      }
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [refreshUserProfile])

  return { user, session }
}
