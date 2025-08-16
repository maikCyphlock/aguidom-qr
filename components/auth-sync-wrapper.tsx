"use client";

import { useAuthSync } from "@/lib/hooks/use-auth";
import type { ReactNode } from "react";

interface AuthSyncWrapperProps {
  children: ReactNode;
}

export function AuthSyncWrapper({ children }: AuthSyncWrapperProps) {
  // This will handle the auth state synchronization
  useAuthSync();
  
  // Render the children - the auth sync happens in the hook
  return <>{children}</>;
}
