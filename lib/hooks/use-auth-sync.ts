import { useCallback, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()
const USER_PROFILE_QUERY = ['user-profile']

/**
 * Hook to sync authentication state with the application
 * Manages user state and updates related queries
 */
export function useAuthSync() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  // Update user profile queries based on auth state
  const updateAuthState = useCallback(async (user: User | null) => {
    if (user) {
      setUser(user)
      await queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY })
    } else {
      setUser(null)
      await queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY })
    }
  }, [queryClient, setUser])

  // Handle initial auth state
  const initializeAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await updateAuthState(user || null)
  }, [updateAuthState])

  useEffect(() => {
    // Initial auth setup
    initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async () => {
        const { data: { user } } = await supabase.auth.getUser()
        await updateAuthState(user || null)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [initializeAuth, updateAuthState])

  return { user }
}
