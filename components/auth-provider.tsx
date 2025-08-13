"use client";

import { useAuthSync } from '@/lib/hooks/use-auth-sync'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync()
  
  return <>{children}</>
}
