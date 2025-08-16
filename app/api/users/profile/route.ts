import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!userProfile) {
      return new NextResponse('User not found', { status: 404 });
    }

    const headers = {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'SameSite': 'Lax'
    };

    return new NextResponse(JSON.stringify(userProfile), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
