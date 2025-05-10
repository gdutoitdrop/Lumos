import nodemailer from "nodemailer"
import { createClient } from "@/lib/supabase/server"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Email templates
const emailTemplates = {
  match_created: (data: any) => ({
    subject: "New Match on Lumos!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e11d48;">New Match on Lumos!</h1>
        <p>Good news! You have a new match with ${data.match_name}.</p>
        <p>Their match score with you is ${Math.round(data.match_score * 100)}%.</p>
        <p>Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/matching" style="color: #e11d48;">matches page</a> to connect!</p>
      </div>
    `,
  }),
  new_message: (data: any) => ({
    subject: "New Message on Lumos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e11d48;">New Message on Lumos</h1>
        <p>You have a new message from ${data.sender_name}.</p>
        <p>Message preview: "${data.message_preview}"</p>
        <p>Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages/${data.conversation_id}" style="color: #e11d48;">conversation</a> to reply!</p>
      </div>
    `,
  }),
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
        <p>We've received your payment of ${data.amount} ${data.currency.toUpperCase()} for Lumos Premium.</p>
        <p>Your subscription will continue uninterrupted.</p>
        <p>You can view your invoice <a href="${data.invoice_url}" style="color: #e11d48;">here</a>.</p>
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

export async function sendEmail(to: string, type: keyof typeof emailTemplates, data: any) {
  try {
    const template = emailTemplates[type](data)

    await transporter.sendMail({
      from: `"Lumos" <${process.env.EMAIL_FROM}>`,
      to,
      subject: template.subject,
      html: template.html,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function processEmailQueue() {
  const supabase = createClient()

  // Get unsent notifications
  const { data: notifications, error } = await supabase
    .from("email_notifications")
    .select("*, profiles(email)")
    .eq("is_sent", false)
    .limit(50)

  if (error) {
    console.error("Error fetching email notifications:", error)
    return { success: false, error }
  }

  if (!notifications || notifications.length === 0) {
    return { success: true, processed: 0 }
  }

  let successCount = 0
  let failureCount = 0

  // Process each notification
  for (const notification of notifications) {
    const email = notification.profiles?.email

    if (!email) {
      // Mark as sent but log error
      await supabase
        .from("email_notifications")
        .update({ is_sent: true, sent_at: new Date().toISOString() })
        .eq("id", notification.id)

      console.error(`No email found for profile ${notification.profile_id}`)
      failureCount++
      continue
    }

    try {
      // Send the email
      const result = await sendEmail(email, notification.type as keyof typeof emailTemplates, notification.data)

      if (result.success) {
        // Mark as sent
        await supabase
          .from("email_notifications")
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .eq("id", notification.id)

        successCount++
      } else {
        failureCount++
      }
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error)
      failureCount++
    }
  }

  return {
    success: true,
    processed: notifications.length,
    successful: successCount,
    failed: failureCount,
  }
}
