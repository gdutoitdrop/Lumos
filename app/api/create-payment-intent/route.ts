import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json()
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Define plan prices
    const planPrices = {
      premium: 999, // $9.99 in cents
      premium_plus: 1999, // $19.99 in cents
    }

    const amount = planPrices[planType as keyof typeof planPrices]

    if (!amount) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId: user.id,
        planType,
      },
    })

    // Save payment record
    await supabase.from("payment_history").insert({
      user_id: user.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount,
      currency: "usd",
      status: "pending",
      plan_type: planType,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
