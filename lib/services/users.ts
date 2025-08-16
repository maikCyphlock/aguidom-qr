import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export async function getUsers() {
  const supabase = createClient();
  
  // Get users from Supabase Auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users from Supabase Auth:', authError);
    throw new Error('Failed to fetch users from Supabase Auth');
  }

  // Get users from your database
  const dbUsers = await db.select().from(users);

  // Combine the data
  const combinedUsers = authUsers.users.map(authUser => {
    const dbUser = dbUsers.find(u => u.userId === authUser.id);
    return {
      ...authUser,
      ...dbUser
    };
  });

  return combinedUsers;
}

export async function getUserById(userId: string) {
  const supabase = createClient();
  
  // Get user from Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  
  if (authError) {
    console.error('Error fetching user from Supabase Auth:', authError);
    throw new Error('Failed to fetch user from Supabase Auth');
  }

  // Get user from your database
  const [dbUser] = await db.select().from(users).where(eq(users.userId, userId)).limit(1);

  return {
    ...authUser.user,
    ...dbUser
  };
}

export async function searchUsers(query: string) {
  // This will use the existing API endpoint for searching users
  const response = await fetch(`/api/user/search?query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error searching users:', error);
    throw new Error(error.message || 'Failed to search users');
  }
  
  return response.json();
}
