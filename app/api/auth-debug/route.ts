import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession()

    // Get auth settings (this will only work if you have admin privileges)
    const { data: authSettings, error: authError } = await supabase.from("auth_settings").select("*").limit(1).single()

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      session: sessionData,
      authSettings: authError ? { error: authError.message } : authSettings,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
