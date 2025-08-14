import { getAuthenticatedUserFromServer } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function SecurityLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userFromDb } = await getAuthenticatedUserFromServer();

	if (userFromDb.role !== "admin") {
		return redirect("/dashboard");
	}

	return <>{children}</>;
}
