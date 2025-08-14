import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addUserToClubSchema } from "@/lib/validation/schemas";
import { apiErrorHandler } from "@/lib/utils/error-handler";
import { getAuthenticatedUser } from "@/lib/services/user.service";
import {
  getUsersWithoutClub,
  addUserToClub,
} from "@/lib/services/club.service";
import { ErrorUnauthorized } from "@/app/api/Error";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw new ErrorUnauthorized("User not authenticated");
    }

    const users = await getUsersWithoutClub();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw new ErrorUnauthorized("User not authenticated");
    }

    const body = await request.json();
    const { clubId, userId } = addUserToClubSchema.parse(body);

    const requester = await getAuthenticatedUser(authUser);
    await addUserToClub(clubId, userId, requester.userId);

    return NextResponse.json({
      success: true,
      message: "User added to club successfully",
    });
  } catch (error) {
    return apiErrorHandler(error);
  }
}