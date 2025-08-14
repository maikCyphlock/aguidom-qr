import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClubSchema } from "@/lib/validation/schemas";
import { apiErrorHandler } from "@/lib/utils/error-handler";
import { getAuthenticatedUser } from "@/lib/services/user.service";
import { createClub, getClubByUserId } from "@/lib/services/club.service";
import { ErrorUnauthorized } from "@/app/api/Error";

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
    // Zod's `parse` will throw an error if validation fails, which is caught by the handler
    const clubData = createClubSchema.parse(body);

    const user = await getAuthenticatedUser(authUser);
    const newClub = await createClub(clubData, user.userId);

    return NextResponse.json({ success: true, data: newClub }, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

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

    const user = await getAuthenticatedUser(authUser);
    const club = await getClubByUserId(user.userId);

    return NextResponse.json({ success: true, data: club });
  } catch (error) {
    return apiErrorHandler(error);
  }
}