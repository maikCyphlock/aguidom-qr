"use client";

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserProfile, SyncUserData } from '@/types/user';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';

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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Invalidate any queries that depend on auth state
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Handle auth state changes
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await syncUserWithDatabase(session.user as AuthUserData);
          router.refresh();
        } catch (error) {
          console.error('Error during sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear any sensitive data from the cache
        queryClient.clear();
        router.refresh();
} else if (event === 'USER_UPDATED' && session?.user) {
        // Sync user data when profile is updated
        try {
          await syncUserWithDatabase(session.user as AuthUserData);
          queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        } catch (error) {
          console.error('Error updating user:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router, supabase.auth]);
}

export function useUser() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Sync user data with database
      if (user) {
        try {
          await syncUserWithDatabase(user);
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
      
      return user;
    },
  });
}

export function useUserProfile() {

  const { data: user } = useUser();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {   
      const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user data');
    }
      return (await response.json()) as UserProfile;
    },
    enabled: !!user,
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
  const router = useRouter();
  
  return async () => {
    await supabase.auth.signOut();
    await queryClient.clear();
    router.refresh();
  };
}
