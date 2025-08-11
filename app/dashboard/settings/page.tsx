import { createClient, SupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./profile-form";
import { Effect } from "effect";

// This is the core logic of the page, written as an Effect.
// It will run and require the SupabaseClient, which we provide later.
const profilePageLogic = Effect.gen(function* () {
  // Request the Supabase client from the Effect context.
  // This is the correct way to get the client from the layer.
  const supabase = yield* SupabaseClient;

  // Use the Effect.promise helper to wrap the asynchronous Supabase call.
  // This integrates the async operation into the Effect workflow.
  const { data: { claims } } = yield* Effect.promise(() => supabase.auth.getClaims());

  const user = claims;
  if (!user) {
    // If the user doesn't exist, return a signal to redirect.
    // We handle the actual redirect outside the Effect.
    return { shouldRedirect: true, user: null, userFromDb: null };
  }

  // Fetch the user from the database, also wrapped in Effect.promise.
  const userFromDb = yield* Effect.promise(() =>
    db.select().from(users).where(eq(users.email, user.email)).get()
  );

  // Return the fetched data
  return { shouldRedirect: false, user, userFromDb };
});

export default async function ProfilePage() {
  // Use Effect.runPromise to execute the logic.
  // We use .pipe(Effect.provide(createClient)) to inject the Supabase client layer.
  const { shouldRedirect, user, userFromDb } = await Effect.runPromise(
    profilePageLogic.pipe(
      Effect.provide(createClient)
    )
  );

  if (shouldRedirect) {
    return redirect("/auth/login");
  }

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
