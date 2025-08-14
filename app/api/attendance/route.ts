import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { attendance, users, clubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedUserFromServer } from "@/lib/auth/server";
import { nanoid } from "nanoid";

export async function GET() {
	try {
		const { userFromDb } = await getAuthenticatedUserFromServer();

		if (!userFromDb.clubId) {
			return NextResponse.json({ error: "No clubId" }, { status: 400 });
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

export async function POST(request: NextRequest) {
	try {
		const { userFromDb: vigilante } = await getAuthenticatedUserFromServer();

		if (vigilante.role !== "vigilante") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const body = await request.json();
		const { userId } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: "userId is required" },
				{ status: 400 },
			);
		}

		const userToRegister = await db
			.select()
			.from(users)
			.where(eq(users.userId, userId))
			.get();

		if (!userToRegister) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		await db.insert(attendance).values({
			attendanceId: nanoid(),
			userId: userToRegister.userId,
			clubId: userToRegister.clubId,
			deviceId: vigilante.userId, // Usar el ID del vigilante como ID del dispositivo
		});

		return NextResponse.json({
			message: `Entrada registrada para ${userToRegister.name}`,
		});
	} catch (error) {
		console.error("Error al registrar la entrada:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
