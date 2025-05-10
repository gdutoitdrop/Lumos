import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing Stripe environment variables")
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  })

  const body = await request.text()
  const signature = request.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId || !customerId || !subscriptionId) {
          throw new Error("Missing required data in webhook")
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // Check if subscription already exists
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single()

        if (existingSubscription) {
          // Update existing subscription
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              status: subscription.status,
              current_period_end: currentPeriodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSubscription.id)
        } else {
          // Create new subscription
          await supabase.from("subscriptions").insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
          })
        }

        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        const customerId = invoice.customer as string

        if (!subscriptionId || !customerId) {
          throw new Error("Missing required data in webhook")
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // Update subscription
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // Update subscription
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        // Update subscription
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId)

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Error handling webhook: ${error.message}`)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const GET = POST
