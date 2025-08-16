import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';



export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }


    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.userId, user.id));
    

  

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error('Error syncing user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
