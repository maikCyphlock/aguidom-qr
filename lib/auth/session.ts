import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ErrorUnauthorized } from "@/app/api/Error";

export async function getUserEmail(): Promise<string> {
	const supabase = await createSupabaseServerClient();
	const { data: sessionData } = await supabase.auth.getSession();

	const email = sessionData?.session?.user?.email;
	if (!email) {
		throw new ErrorUnauthorized("Unauthorized: no email found in session");
	}

	return email;
}
