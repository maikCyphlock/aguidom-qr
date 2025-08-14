import { ProfileForm } from "./profile-form";
import { getAuthenticatedUserFromServer } from "@/lib/auth/server";
export default async function ProfilePage() {
	const {userFromDb , user} = await getAuthenticatedUserFromServer();

	return (
		<div className="flex-1 w-full flex flex-col p-2 items-center">
			<ProfileForm user={user} userFromDb={userFromDb} />
		</div>
	);
}
