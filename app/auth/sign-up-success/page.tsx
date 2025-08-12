import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Page() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();
	if (error || !data.user) {
		return redirect("/auth/login");
	}

	try {
		const userOnDb = await db
			.select()
			.from(users)
			.where(eq(users.userId, data.user.id))
			.get();
		if (!userOnDb) {
			await db.insert(users).values({
				userId: data.user.id,
				email: data.user.email as string,
			});
		}
	} catch (err: any) {
		if (
			typeof err?.message === "string" &&
			err.message.includes("SQLITE_CONSTRAINT")
		) {
			console.log("User already exists, skipping creation.");
		} else {
			console.error("An unexpected error occurred while processing user:", err);
		}
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">
								¡Gracias por registrarte!
							</CardTitle>
							<CardDescription>Revisa tu correo para confirmar</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Te has registrado con éxito. Por favor, revisa tu correo
								electrónico para confirmar tu cuenta antes de iniciar sesión.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
