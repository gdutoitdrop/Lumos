import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature") || ""

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Missing STRIPE_WEBHOOK_SECRET, skipping signature verification")
      return NextResponse.json({ received: true })
    }

    try {
      const stripe = getStripe()
      const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

      const supabase = createClient()

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any
          const userId = session.metadata.userId
          const plan = session.metadata.plan
          const subscriptionId = session.subscription

          // Update the user's subscription
          await supabase.from("subscriptions").upsert({
            profile_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer,
            plan,
            status: "active",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now as placeholder
          })

          // Add to email queue
          await supabase.from("email_queue").insert({
            profile_id: userId,
            template: "subscription_created",
            data: { plan },
            status: "pending",
          })

          break
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object as any
          const subscriptionId = invoice.subscription

          // Get the subscription from the database
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("profile_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single()

          if (subscription) {
            // Update the subscription period
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)

            await supabase
              .from("subscriptions")
              .update({
                status: "active",
                current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              })
              .eq("stripe_subscription_id", subscriptionId)

            // Add to email queue
            await supabase.from("email_queue").insert({
              profile_id: subscription.profile_id,
              template: "payment_succeeded",
              data: { amount: invoice.amount_paid / 100 },
              status: "pending",
            })
          }

          break
        }
        case "customer.subscription.updated": {
          const stripeSubscription = event.data.object as any

          await supabase
            .from("subscriptions")
            .update({
              status: stripeSubscription.status,
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", stripeSubscription.id)

          break
        }
        case "customer.subscription.deleted": {
          const stripeSubscription = event.data.object as any

          // Get the subscription from the database
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("profile_id")
            .eq("stripe_subscription_id", stripeSubscription.id)
            .single()

          // Update the subscription status
          await supabase
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", stripeSubscription.id)

          if (subscription) {
            // Add to email queue
            await supabase.from("email_queue").insert({
              profile_id: subscription.profile_id,
              template: "subscription_canceled",
              data: {},
              status: "pending",
            })
          }

          break
        }
      }

      return NextResponse.json({ received: true })
    } catch (err) {
      console.error("Webhook error:", err)
      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
