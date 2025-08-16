"use client";

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile, SyncUserData } from '@/types/user';

interface AuthUserData {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

async function syncUserWithDatabase(user: AuthUserData | null): Promise<UserProfile | null> {
  if (!user) return null;

  const userData: SyncUserData = {
    userId: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || '',
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };

  try {
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user data');
    }

    return (await response.json()) as UserProfile;
  } catch (error) {
    console.error('Error syncing user with database:', error);
    throw error;
  }
}

export function useAuthSync() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handleAuthChange = async (event: string, session: { user: AuthUserData | null } | null) => {
      // Prevent multiple simultaneous auth state changes
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      try {
        // Only invalidate queries if the auth state actually changed
        if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
          await queryClient.invalidateQueries({ 
            queryKey: ['user'],
            refetchType: 'active',
          });
        }

        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserWithDatabase(session.user as AuthUserData);
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          // Clear sensitive data from the cache
          queryClient.clear();
          router.refresh();
        } else if (event === 'USER_UPDATED' && session?.user) {
          // Only invalidate profile if user data was updated
          queryClient.invalidateQueries({ 
            queryKey: ['userProfile'],
            refetchType: 'active',
          });
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router, supabase.auth.onAuthStateChange]);
}

export function useUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Only sync user data if we don't have it yet
      if (user) {
        try {
          // Use a separate query to check if we need to sync
          const needsSync = !queryClient.getQueryData(['userProfile', user.id]);
          if (needsSync) {
            await syncUserWithDatabase(user);
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
      
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUserProfile() {
  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {   
      if (!user?.id) return null;
      
      const response = await fetch(`/api/users/profile?id=${user.id}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useSignIn() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  return async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    }
    
    return { error };
  };
}

export function useSignInWithGoogle() {
  const supabase = createClient();
  
  return async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Google OAuth error:', error);
      return { error };
    }
    
    // The actual sign-in will be handled by the callback route
    return { data };
  };
}

export function useSignOut() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  
  return async () => {
    await supabase.auth.signOut();
    await queryClient.clear();
  };
}
