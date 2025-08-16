import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { AuthState } from '@/types/auth'

const supabase = createClient()

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Create a type that includes both the state and the getter
type AuthStoreWithGetters = AuthStore & {
  getCurrentUser: () => User | null;
};

export const useAuthStore = create<AuthStoreWithGetters>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
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
          
          // Invalidate fetch de perfil lo maneja el hook de auth con React Query
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
          
          // Invalidate fetch de perfil lo maneja el hook de auth con React Query
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al registrarse',
            isLoading: false 
          })
        }
      },

      // Iniciar sesión con Google
      signInWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // Redirigir a la autenticación de Google
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })
          
          if (error) throw error
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al iniciar sesión con Google',
            isLoading: false 
          })
        }
      },

      signOut: async () => {
        console.log('signOut')
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase.auth.signOut({ scope:'global'})
          
          if (error) throw error
          
          set({ 
            user: null, 
            session: null,
            isLoading: false 
          })
          // Forzar limpieza de caché de perfil en React Query (si existe provider)
          try {
            const { QueryClient } = await import('@tanstack/react-query')
            const client = new QueryClient()
            client.removeQueries({ queryKey: ['user-profile'] })
          } catch {}
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

      // Lectura del perfil: ahora la hace React Query; mantenemos userProfile solo para compatibilidad de componentes en transición


      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      // Method to get current user
      getCurrentUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session
      }),
    }
  )
)
