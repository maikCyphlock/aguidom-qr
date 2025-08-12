"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function handleLogout() {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
	redirect("/auth/login");
}
