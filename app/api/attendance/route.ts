import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendance, users, clubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
	try {
		const { shouldRedirect, userFromDb } = await getAuthenticatedUser();
		if (shouldRedirect || !userFromDb) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const club = await db
			.select()
			.from(clubs)
			.where(eq(clubs.id, userFromDb.clubId))
			.get();

		if (!club) {
			return NextResponse.json({ error: "Club not found" }, { status: 404 });
		}

		const rows = await db
			.select({
				attendanceId: attendance.attendanceId,
				scanTime: attendance.scanTime,
				deviceId: attendance.deviceId,
				userName: users.name,
			})
			.from(attendance)
			.leftJoin(users, eq(attendance.userId, users.userId))
			.where(eq(attendance.clubId, club.id))
			.orderBy(desc(attendance.scanTime));

		return NextResponse.json(
			rows.map((r) => ({ ...r, clubName: club.name })),
			{ status: 200 },
		);
	} catch (error) {
		console.error("Attendance API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
