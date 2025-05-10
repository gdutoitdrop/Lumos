import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId = session.metadata.userId
        const plan = session.metadata.plan

        // Create or update subscription
        await supabase.from("subscriptions").upsert({
          profile_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_type: plan,
          status: "active",
          current_period_start: new Date(session.created * 1000).toISOString(),
          current_period_end: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from creation
        })

        // Create email notification
        await supabase.from("email_notifications").insert({
          profile_id: userId,
          type: "subscription_created",
          data: {
            plan,
            customer_email: session.customer_details.email,
          },
          is_sent: false,
        })

        break
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        const customerId = invoice.customer

        // Get the subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Update subscription period
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("profile_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single()

        if (existingSubscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId)

          // Create email notification
          await supabase.from("email_notifications").insert({
            profile_id: existingSubscription.profile_id,
            type: "payment_succeeded",
            data: {
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              invoice_url: invoice.hosted_invoice_url,
            },
            is_sent: false,
          })
        }
        break
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as any
        const subscriptionId = subscription.id

        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)
        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any
        const subscriptionId = subscription.id

        // Get the subscription from the database
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("profile_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single()

        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscriptionId)

        if (existingSubscription) {
          // Create email notification
          await supabase.from("email_notifications").insert({
            profile_id: existingSubscription.profile_id,
            type: "subscription_canceled",
            data: {
              canceled_at: new Date().toISOString(),
            },
            is_sent: false,
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
