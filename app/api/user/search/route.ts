import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { or, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("query");

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter is required" },
			{ status: 400 },
		);
	}

	try {
		const results = await db
			.select()
			.from(users)
			.where(
				or(like(users.name, `%${query}%`), like(users.idNumber, `%${query}%`)),
			)
			.limit(10);

		return NextResponse.json(results);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to search for users" },
			{ status: 500 },
		);
	}
}
