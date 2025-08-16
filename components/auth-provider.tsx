"use client";

import { useAuthSync } from '@/lib/hooks/use-auth-sync'
import { useUserProfileQuery } from '@/lib/hooks/use-user-profile-query'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync()
  // Monta la query para que exista en caché y sea visible en devtools
  useUserProfileQuery()
  
  return <>{children}</>
}
