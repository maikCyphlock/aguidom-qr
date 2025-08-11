// lib/supabase/server.ts
import { Config, Context, Data, Effect, Layer } from "effect";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Assuming you have generated TypeScript types for your Supabase database.
// You can generate them using the Supabase CLI or a script like types.sh with your project ID,
// which creates a database.ts file. Import the Database type from there.

// Define a custom error for Supabase-related issues (optional but recommended for better error handling)
class SupabaseClientError extends Data.TaggedError("SupabaseClientError")<{
	readonly cause: unknown;
}> {}

// Define a Tag for the Supabase client service for dependency injection
export class SupabaseClient extends Context.Tag("SupabaseClient")<
	SupabaseClient,
	ReturnType<typeof createServerClient>
>() {}

// Create a live Layer that provides the Supabase client
// This uses Effect.gen for composition, Config for environment variables,
// and Effect.promise for handling the async cookies() call.
export const createClient = Layer.effect(
	SupabaseClient,
	Effect.gen(function* () {
		// Load environment variables using Config (fails with ConfigError if missing)
		const url = yield* Config.string("NEXT_PUBLIC_SUPABASE_URL");
		const anonKey = yield* Config.string(
			"NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
		);

		// Handle async cookie retrieval as an Effect
		const cookieStore = yield* Effect.promise(() => cookies());

		// Create the Supabase client, wrapping potential errors
		return yield* Effect.try({
			try: () =>
				createServerClient(url, anonKey, {
					cookies: {
						getAll() {
							return cookieStore.getAll();
						},
						setAll(cookiesToSet) {
							try {
								cookiesToSet.forEach(({ name, value, options }) =>
									cookieStore.set(name, value, options),
								);
							} catch {
								// The `setAll` method was called from a Server Component.
								// This can be ignored if you have middleware refreshing user sessions.
							}
						},
					},
				}),
			catch: (cause) => new SupabaseClientError({ cause }),
		});
	}),
);
