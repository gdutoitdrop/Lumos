import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { action, email, password } = await request.json()
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    if (action === "create-test-user") {
      // Check if user exists first
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)

      if (existingUser) {
        return NextResponse.json({
          success: true,
          message: "Test user already exists",
          user: existingUser,
        })
      }

      // Create user if doesn't exist
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: { full_name: "Test User" },
      })

      if (error) {
        console.error("Error creating test user:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: "Test user created successfully",
        user: data.user,
      })
    }

    if (action === "verify-user") {
      // Force verify a user's email
      const { data, error } = await supabase.auth.admin.updateUserById(
        email, // actually using this as the user ID in this case
        { email_confirm: true },
      )

      if (error) {
        console.error("Error verifying user:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: "User verified successfully",
        user: data.user,
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
