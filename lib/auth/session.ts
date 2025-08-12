import { createSupabaseServerClient } from "@/lib/supabase/server";
import { QRError } from "../errors/qr-errors";

export async function getUserEmail(): Promise<string> {
	const supabase = await createSupabaseServerClient();
	const { data: sessionData } = await supabase.auth.getSession();

	const email = sessionData?.session?.user?.email;
	if (!email) {
		throw new QRError("Unauthorized: no email found in session", 401);
	}

	return email;
}
