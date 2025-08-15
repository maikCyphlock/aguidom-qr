import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ErrorUnauthorized } from "@/app/api/Error";

export async function getUserEmail(): Promise<string> {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user?.email) {
		throw new ErrorUnauthorized("Unauthorized: no email found in authenticated user");
	}

	return data.user.email;
}
