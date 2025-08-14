import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedUserResult = {
	shouldRedirect: boolean;
	claims:  unknown | null;
	userFromDb: typeof users.$inferSelect | undefined;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult> {
	try {
		const supabase = await createSupabaseServerClient();
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			return { shouldRedirect: true, claims: null, userFromDb: undefined };
		}

		const user = session.user;
		const userFromDb = await db
			.select()
			.from(users)
			.where(eq(users.email, user.email!))
			.get();

		return {
			shouldRedirect: false,
			claims: user,
			userFromDb,
		};
	} catch (error) {
		console.error("Authentication error:", error);
		return { shouldRedirect: true, claims: null, userFromDb: undefined };
	}
}
