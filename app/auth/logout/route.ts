
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";


export async function GET(request: NextRequest) {
    const supabase = await  createSupabaseServerClient()
    
    //get redirrect 
    const redirect = request.nextUrl.searchParams.get('redirect')

    const result =  await supabase.auth.signOut()

    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
    }
    
    const redirectUrl = new URL(redirect ?? '/', request.url);
    
    return NextResponse.redirect(redirectUrl);

}
