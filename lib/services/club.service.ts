import { db } from "@/lib/db";
import { clubs, users } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  ErrorNotFound,
  ErrorForbidden,
  ErrorBadRequest,
} from "@/app/api/Error";
import type { z } from "zod";
import type { createClubSchema } from "../validation/schemas";

type Club = typeof clubs.$inferSelect;
type User = typeof users.$inferSelect;

/**
 * Creates a new club and assigns the creator as the owner.
 * @param clubData The validated data for the new club.
 * @param ownerId The ID of the user creating the club.
 * @returns The newly created club.
 */
export async function createClub(
  clubData: z.infer<typeof createClubSchema>,
  ownerId: string
): Promise<Club> {
  const newClub = {
    id: nanoid(),
    ...clubData,
    ownerId: ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertedClubs = await db.insert(clubs).values(newClub).returning();
  const club = insertedClubs[0];

  if (!club) {
    // This case should ideally not happen if DB is configured correctly
    throw new Error("Failed to create club due to a database error.");
  }

  // Assign the clubId to the user who created the club
  await db
    .update(users)
    .set({ clubId: club.id })
    .where(eq(users.userId, ownerId));

  return club;
}

/**
 * Retrieves the club associated with a given user.
 * @param userId The ID of the user.
 * @throws {ErrorNotFound} If the user has no club or the club doesn't exist.
 * @returns The club object.
 */
export async function getClubByUserId(userId: string): Promise<Club> {
    const user = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    if (!user[0] || !user[0].clubId) {
        throw new ErrorNotFound("User is not associated with any club.");
    }

    const clubResult = await db.select().from(clubs).where(eq(clubs.id, user[0].clubId)).limit(1);
    if (!clubResult[0]) {
        throw new ErrorNotFound("Club not found.");
    }

    return clubResult[0];
}

/**
 * Retrieves all users who are not currently assigned to a club.
 * @returns An array of user objects.
 */
export async function getUsersWithoutClub(): Promise<User[]> {
  return await db.select().from(users).where(isNull(users.clubId));
}

/**
 * Adds a user to a club.
 * @param clubId The ID of the club.
 * @param userId The ID of the user to add.
 * @param requesterId The ID of the user making the request, who must be the club owner.
 * @throws {ErrorNotFound} If the club or user to be added is not found.
 * @throws {ErrorForbidden} If the requester is not the owner of the club.
 * @throws {ErrorBadRequest} If the user to be added already belongs to a club.
 */
export async function addUserToClub(clubId: string, userId: string, requesterId: string): Promise<void> {
    const clubResult = await db.select().from(clubs).where(eq(clubs.id, clubId)).limit(1);
    const club = clubResult[0];

    if (!club) {
        throw new ErrorNotFound("Club not found.");
    }

    if (club.ownerId !== requesterId) {
        throw new ErrorForbidden("You do not have permission to add users to this club.");
    }

    const userToAddResult = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    const userToAdd = userToAddResult[0];

    if (!userToAdd) {
        throw new ErrorNotFound("User to add not found.");
    }

    if (userToAdd.clubId) {
        throw new ErrorBadRequest("User already belongs to a club.");
    }

    await db.update(users).set({ clubId: clubId }).where(eq(users.userId, userId));
}
