import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe, PLANS } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const { plan, returnUrl } = await request.json()

    // Validate the plan
    if (!Object.keys(PLANS).includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if the user already has a subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("profile_id", user.id)
      .single()

    let stripeCustomerId = existingSubscription?.stripe_customer_id

    // If the user doesn't have a Stripe customer ID, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.full_name || profile.username || user.email,
        metadata: {
          userId: user.id,
        },
      })
      stripeCustomerId = customer.id
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: PLANS[plan as keyof typeof PLANS].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
