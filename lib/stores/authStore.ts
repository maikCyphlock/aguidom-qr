import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { AuthState, UserProfile } from '@/types/auth'

const supabase = createClient()

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Sincronización con base de datos
  syncUserProfile: (email: string) => Promise<void>
  refreshUserProfile: () => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      userProfile: null,
      isLoading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) throw error
          
          set({ 
            user: data.user, 
            session: data.session,
            isLoading: false 
          })
          
          // Sincronizar perfil del usuario después del login
          if (data.user?.email) {
            await get().syncUserProfile(data.user.email)
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
            isLoading: false 
          })
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })
          
          if (error) throw error
          
          set({ 
            user: data.user, 
            session: data.session,
            isLoading: false 
          })
          
          // Sincronizar perfil del usuario después del registro
          if (data.user?.email) {
            await get().syncUserProfile(data.user.email)
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al registrarse',
            isLoading: false 
          })
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase.auth.signOut()
          
          if (error) throw error
          
          set({ 
            user: null, 
            session: null,
            userProfile: null,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al cerrar sesión',
            isLoading: false 
          })
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase.auth.resetPasswordForEmail(email)
          
          if (error) throw error
          
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al resetear contraseña',
            isLoading: false 
          })
        }
      },

      updatePassword: async (password: string) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase.auth.updateUser({
            password
          })
          
          if (error) throw error
          
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al actualizar contraseña',
            isLoading: false 
          })
        }
      },

      // Sincronizar perfil del usuario desde la API
      syncUserProfile: async () => {
        try {
          const response = await fetch('/api/user/profile')
          
          if (!response.ok) {
            if (response.status === 404) {
              // Usuario no tiene perfil, crear uno básico
              set({ userProfile: null })
              return
            }
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          if (data.success && data.profile) {
            set({ userProfile: data.profile })
          }
        } catch (error) {
          console.error('Error sincronizando perfil:', error)
          set({ userProfile: null })
        }
      },

      // Refrescar perfil del usuario actual
      refreshUserProfile: async () => {
        const { user } = get()
        if (user?.email) {
          await get().syncUserProfile(user.email)
        }
      },

      // Actualizar perfil del usuario
      updateUserProfile: async (data: Partial<UserProfile>) => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          if (result.success && result.profile) {
            set({ userProfile: result.profile })
          }
        } catch (error) {
          console.error('Error actualizando perfil:', error)
          throw error
        }
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setUserProfile: (profile: UserProfile | null) => set({ userProfile: profile }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session,
        userProfile: state.userProfile
      }),
    }
  )
)
