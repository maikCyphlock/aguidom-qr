import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { attendance } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedUserFromServer } from "@/lib/auth/server";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    // Get all stadium entries with description "Entrada del estadio"
    const entries = await db
      .select()
      .from(attendance)
      .where(eq(attendance.description, "Entrada del estadio"))
      .orderBy(desc(attendance.scanTime));

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error("App Security Attendance GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userFromDb: securityUser } = await getAuthenticatedUserFromServer();

    // Verify the user has security role (you might want to adjust this based on your roles)
    if (securityUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, description = "Entrada del estadio" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get user to register
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.userId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new attendance record
    const newEntry = {
      attendanceId: nanoid(),
      userId: user.userId,
      clubId: user.clubId,
      // Security user ID as device ID
      description,
      scanTime: new Date(), // Use a Date object for Drizzle ORM
    };

    await db.insert(attendance).values(newEntry);

    return NextResponse.json(
      { 
        message: `Entrada al estadio registrada para ${user.name}`,
        data: newEntry
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar entrada al estadio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
