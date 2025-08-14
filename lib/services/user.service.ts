import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ErrorNotFound } from "@/app/api/Error";
import type { User as AuthUser } from "@supabase/supabase-js";

export type User = typeof users.$inferSelect;

/**
 * Retrieves the full user profile from the database based on the authenticated Supabase user.
 * @param authUser The user object from Supabase authentication.
 * @throws {ErrorNotFound} If the user is not found in the database.
 * @returns The user profile.
 */
export async function getAuthenticatedUser(authUser: AuthUser): Promise<User> {
  if (!authUser.email) {
    // This should ideally not happen if called after a successful auth check.
    throw new ErrorNotFound("User email not found in authentication session.");
  }

  const userFromDb = await db
    .select()
    .from(users)
    .where(eq(users.email, authUser.email))
    .limit(1);

  if (!userFromDb || userFromDb.length === 0) {
    throw new ErrorNotFound("User not found in database.");
  }

  return userFromDb[0];
}
