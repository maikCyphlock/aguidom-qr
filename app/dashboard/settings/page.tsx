import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();
	const user = data.user;

	if (error || !user) {
		return redirect("/auth/login");
	}

	const userFromDb = await db
		.select()
		.from(users)
		.where(eq(users.email, user.email as string))
		.get();

	if (!user || !userFromDb) {
		// A safeguard in case something went wrong, though the previous check should handle it.
		return redirect("/auth/login");
	}

	return (
		<div className="flex-1 w-full flex flex-col p-2 items-center">
			<ProfileForm user={user} userFromDb={userFromDb} />
		</div>
	);
}
