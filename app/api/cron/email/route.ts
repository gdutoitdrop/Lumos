import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const cronSecret = searchParams.get("cronSecret")

    if (cronSecret !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Get emails that need to be sent (status = 'pending', attempts < 3)
    const { data: emails, error } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lt("attempts", 3)
      .order("created_at", { ascending: true })
      .limit(10)

    if (error) {
      console.error("Error fetching emails:", error)
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
    }

    if (!emails || emails.length === 0) {
      return NextResponse.json({ message: "No emails to send" })
    }

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Process each email
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          // Get user email from profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", email.profile_id)
            .single()

          if (profileError || !profile?.email) {
            throw new Error("Profile not found or no email")
          }

          // Send email based on template
          let subject = "Notification from Lumos"
          let text = "You have a notification from Lumos."
          let html = "<p>You have a notification from Lumos.</p>"

          switch (email.template) {
            case "new_message":
              subject = "New message on Lumos"
              text = `You have a new message on Lumos. Log in to view it.`
              html = `<p>You have a new message on Lumos.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/messages">Click here to view it</a></p>`
              break
            case "new_match":
              subject = "New match on Lumos"
              text = `You have a new match on Lumos! Log in to connect.`
              html = `<p>You have a new match on Lumos!</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/matching">Click here to view your matches</a></p>`
              break
            case "forum_reply":
              subject = "New reply to your forum post"
              text = `Someone replied to your post on the Lumos community forum.`
              html = `<p>Someone replied to your post on the Lumos community forum.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/community">Click here to view the reply</a></p>`
              break
          }

          // Send the email
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: profile.email,
            subject,
            text,
            html,
          })

          // Update email status to sent
          await supabase
            .from("email_queue")
            .update({
              status: "sent",
              updated_at: new Date().toISOString(),
            })
            .eq("id", email.id)

          return { id: email.id, success: true }
        } catch (error: any) {
          console.error(`Error sending email ${email.id}:`, error)

          // Update attempts count
          await supabase
            .from("email_queue")
            .update({
              attempts: email.attempts + 1,
              last_attempt: new Date().toISOString(),
              status: email.attempts + 1 >= 3 ? "failed" : "pending",
              updated_at: new Date().toISOString(),
            })
            .eq("id", email.id)

          return { id: email.id, success: false, error: error.message }
        }
      }),
    )

    return NextResponse.json({
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    })
  } catch (error: any) {
    console.error("Error processing emails:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
