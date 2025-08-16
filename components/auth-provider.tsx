"use client";

import { useAuthSync, useUserProfile } from '@/lib/hooks/use-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();
  // Prefetch user profile to have it in cache
  useUserProfile();
  
  return <>{children}</>;
}
