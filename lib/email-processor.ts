import { createClient } from "@/lib/supabase/server"
import nodemailer from "nodemailer"

// Email templates
const emailTemplates = {
  subscription_created: (data: any) => ({
    subject: "Welcome to Lumos Premium!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e11d48;">Welcome to Lumos Premium!</h1>
        <p>Thank you for subscribing to Lumos Premium. Your subscription is now active.</p>
        <p>You now have access to all premium features including:</p>
        <ul>
          <li>Advanced matching algorithm</li>
          <li>Unlimited matches</li>
          <li>See who liked you</li>
          <li>Priority support</li>
          <li>Ad-free experience</li>
        </ul>
        <p>Visit <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription" style="color: #e11d48;">your subscription page</a> to manage your subscription.</p>
      </div>
    `,
  }),
  payment_succeeded: (data: any) => ({
    subject: "Lumos Premium Payment Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e11d48;">Payment Confirmation</h1>
        <p>We've received your payment for Lumos Premium.</p>
        <p>Your subscription will continue uninterrupted.</p>
      </div>
    `,
  }),
  subscription_canceled: (data: any) => ({
    subject: "Lumos Premium Subscription Canceled",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e11d48;">Subscription Canceled</h1>
        <p>Your Lumos Premium subscription has been canceled.</p>
        <p>You'll continue to have access to premium features until the end of your current billing period.</p>
        <p>We're sorry to see you go. If you'd like to resubscribe, visit <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription" style="color: #e11d48;">your subscription page</a>.</p>
      </div>
    `,
  }),
}

export async function processEmailQueue() {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
    console.warn("Email service not configured")
    return { success: false, error: "Email service not configured" }
  }

  const supabase = createClient()

  // Get pending emails
  const { data: emails, error } = await supabase
    .from("email_queue")
    .select("*, profiles(email)")
    .eq("status", "pending")
    .lt("attempts", 3)
    .order("created_at", { ascending: true })
    .limit(10)

  if (error) {
    console.error("Error fetching emails:", error)
    return { success: false, error }
  }

  if (!emails || emails.length === 0) {
    return { success: true, processed: 0 }
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  let successCount = 0
  let failureCount = 0

  // Process each email
  for (const email of emails) {
    if (!email.profiles?.email) {
      // Update as failed
      await supabase
        .from("email_queue")
        .update({
          status: "failed",
          attempts: email.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq("id", email.id)

      failureCount++
      continue
    }

    try {
      const template = emailTemplates[email.template as keyof typeof emailTemplates]

      if (!template) {
        throw new Error(`Template ${email.template} not found`)
      }

      const { subject, html } = template(email.data)

      // Send email
      await transporter.sendMail({
        from: `"Lumos" <${process.env.EMAIL_FROM}>`,
        to: email.profiles.email,
        subject,
        html,
      })

      // Mark as sent
      await supabase
        .from("email_queue")
        .update({
          status: "sent",
          attempts: email.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq("id", email.id)

      successCount++
    } catch (error) {
      console.error(`Error sending email ${email.id}:`, error)

      // Update attempts
      await supabase
        .from("email_queue")
        .update({
          status: "pending",
          attempts: email.attempts + 1,
          last_attempt: new Date().toISOString(),
        })
        .eq("id", email.id)

      failureCount++
    }
  }

  return {
    success: true,
    processed: emails.length,
    successful: successCount,
    failed: failureCount,
  }
}
