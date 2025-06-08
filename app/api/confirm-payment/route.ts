import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json()
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded") {
      const planType = paymentIntent.metadata.planType

      // Update payment history
      await supabase
        .from("payment_history")
        .update({ status: "completed" })
        .eq("stripe_payment_intent_id", paymentIntentId)

      // Update or create user subscription
      const { error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: planType,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .eq("user_id", user.id)

      if (subscriptionError) {
        console.error("Error updating subscription:", subscriptionError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else {
      // Update payment history as failed
      await supabase
        .from("payment_history")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntentId)

      return NextResponse.json({ error: "Payment failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
