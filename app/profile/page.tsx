'use client';

import { UserProfile } from '@/components/user-profile';
import { useAuthStore } from '@/lib/stores/authStore';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isLoading } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login?redirect=/profile');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <UserProfile />
      </div>
    </div>
  );
}
