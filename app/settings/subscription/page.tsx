import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { Button } from "@/components/ui/button"

export default async function SubscriptionPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's subscription
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("profile_id", user.id).single()

  const isSubscribed = subscription?.status === "active"
  const currentPlan = subscription?.plan

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-muted-foreground">Choose the plan that works best for you</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full md:col-span-1">
            <SubscriptionCard plan="premium" isCurrentPlan={isSubscribed && currentPlan === "premium"} />
          </div>
        </div>

        {isSubscribed && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h2 className="text-lg font-medium mb-2">Manage Your Subscription</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your subscription is currently active and will renew on{" "}
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString()
                : "an unknown date"}
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://billing.stripe.com/p/login/test_28o5kO8Ot2Ql2cg288"
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Billing
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
