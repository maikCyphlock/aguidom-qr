import { redirect, notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, users, clubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import ClubClient, { type AttendanceItem, type Member } from "../client";

type PageProps = {
  params: { id: string };
};

export default async function ClubAdminPage({ params }: PageProps) {
  const { id } = params;
  if (!id) return notFound();

  const { shouldRedirect, userFromDb } = await getAuthenticatedUser();
  if (shouldRedirect || !userFromDb) redirect("/");

  // Only admins of this club can access
  const isAdmin = (userFromDb.role ?? "user").toLowerCase() === "admin";
  if (!isAdmin) redirect("/");
  if (!userFromDb.clubId || userFromDb.clubId !== id) redirect("/");

  const club = await db.select().from(clubs).where(eq(clubs.id, id)).get();
  if (!club) return notFound();

  const rows = await db
    .select({
      attendanceId: attendance.attendanceId,
      scanTime: attendance.scanTime,
      deviceId: attendance.deviceId,
      userName: users.name,
    })
    .from(attendance)
    .leftJoin(users, eq(attendance.userId, users.userId))
    .where(eq(attendance.clubId, id))
    .orderBy(desc(attendance.scanTime));

  const attendances: AttendanceItem[] = rows.map((r) => {
    const scan = r.scanTime as unknown as number | Date;
    const seconds = typeof scan === "number" ? scan : Math.floor(scan.getTime() / 1000);
    return {
      attendanceId: r.attendanceId,
      scanTime: seconds,
      userName: r.userName,
    };
  });

  const memberRows = await db
    .select({
      userId: users.userId,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.clubId, id));

  const members: Member[] = memberRows.map((m) => ({
    userId: m.userId,
    name: m.name,
    email: m.email,
  }));

  return (
    <ClubClient
      club={{ id: club.id, name: club.name }}
      attendances={attendances}
      members={members}
    />
  );
}