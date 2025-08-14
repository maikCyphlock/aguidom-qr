import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type AuthenticatedUserResult = {
	shouldRedirect: boolean;
	claims:  unknown | null;
	userFromDb: typeof users.$inferSelect | undefined;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult> {
	try {
		const supabase = await createSupabaseServerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { shouldRedirect: true, claims: null, userFromDb: undefined };
		}


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
