import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const headers = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'SameSite': 'Lax',
  'Content-Type': 'application/json'
};

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers
      });
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);

    // If user doesn't exist, create them
    if (!existingUser) {
      const userData = {
        email: user.email || '',
        userId: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        // Only include fields that exist in your schema
        ...(user.user_metadata?.avatar_url && { avatar: user.user_metadata.avatar_url }),
        ...(user.user_metadata?.picture && { avatar: user.user_metadata.picture }),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();

      return new NextResponse(JSON.stringify(newUser), { status: 200, headers });
    }

    // Otherwise, return the existing user
    return new NextResponse(JSON.stringify(existingUser), { status: 200, headers });
  } catch (error) {
    console.error('Error syncing user:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }), 
      { status: 500, headers }
    );
  }
}
