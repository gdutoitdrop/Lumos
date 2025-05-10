"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Stripe from "stripe"

export async function createCheckoutSession(priceId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY")
    return { error: "Stripe is not configured" }
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single()

  if (!profile?.email) {
    return { error: "User profile not found" }
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: profile.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      metadata: {
        userId: user.id,
      },
    })

    if (!session.url) {
      return { error: "Failed to create checkout session" }
    }

    return { url: session.url }
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return { error: error.message }
  }
}

export async function createPortalSession() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY")
    return { error: "Stripe is not configured" }
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return { error: "No active subscription found" }
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
    })

    return { url: session.url }
  } catch (error: any) {
    console.error("Error creating portal session:", error)
    return { error: error.message }
  }
}
