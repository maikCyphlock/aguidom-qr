import { z } from "zod";

// --- QR & JWT Schemas ---
export const requestSchema = z.object({
  token: z.string().min(1, "Invalid token"),
});

export const jwtPayloadSchema = z.object({
  clubId: z.string(),
});


// --- Club Schemas ---
export const createClubSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name is too long"),
  location: z.string().min(1, "Location cannot be empty").max(100, "Location is too long"),
  description: z.string().min(1, "Description cannot be empty").max(255, "Description is too long"),
});

export const addUserToClubSchema = z.object({
    clubId: z.string().min(1, "clubId is required"),
    userId: z.string().min(1, "userId is required"),
});


// --- Profile Schemas ---
export const updateProfileSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").max(100, "Name is too long"),
    idNumber: z.string().min(1, "ID number cannot be empty").max(20, "ID number is too long"),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name is too long").optional(),
  phone: z.string().min(1, "Phone number is invalid").max(20, "Phone number is too long").optional(),
  clubId: z.string().min(1, "clubId is invalid").optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});
