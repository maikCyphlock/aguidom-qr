"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import type { UserProfile } from '@/types/auth';

interface UpdateProfileData {
  name?: string;
  phone?: string | null;
  clubId?: string | null;
}

export function useUserProfileQuery() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile | null, Error>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) return null;
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al cargar el perfil');
      }

      const data = await response.json();
      return data?.profile ?? null;
    },
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on 401/404
      if (error.message.includes('401') || error.message.includes('404')) {
        return false;
      }
      return failureCount < 3; // Retry 3 times for other errors
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Error al actualizar el perfil');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the query cache with the new data
      queryClient.setQueryData(['user-profile', user?.id], data.profile);
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });

  return {
    ...query,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
    updateError: updateProfile.error,
  };
}
