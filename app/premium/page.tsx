import { createCheckoutSession, createPortalSession } from "@/actions/premium"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { CheckCircle, Crown } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function PremiumPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Check if user has an active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  const isPremium = !!subscription

  // Client action to handle checkout
  async function handleCheckout() {
    "use server"

    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      console.error("Missing STRIPE_PREMIUM_PRICE_ID")
      return
    }

    const { url, error } = await createCheckoutSession(process.env.STRIPE_PREMIUM_PRICE_ID)

    if (error) {
      console.error("Error creating checkout session:", error)
      return
    }

    if (url) {
      redirect(url)
    }
  }

  // Client action to handle billing portal
  async function handleBillingPortal() {
    "use server"

    const { url, error } = await createPortalSession()

    if (error) {
      console.error("Error creating portal session:", error)
      return
    }

    if (url) {
      redirect(url)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lumos Premium</h1>
        <p className="text-muted-foreground">Upgrade to Lumos Premium for enhanced features and support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Basic features for everyone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">$0</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Basic profile customization</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Limited matches per day</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Access to community forums</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Basic resource library</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-rose-200 dark:border-rose-800">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <CardTitle>Premium Plan</CardTitle>
            </div>
            <CardDescription className="text-white/90">Enhanced features and support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="text-3xl font-bold">
              $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Advanced profile customization</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Unlimited matches</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Priority matching algorithm</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Advanced search filters</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Full resource library access</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPremium ? (
              <form action={handleBillingPortal} className="w-full">
                <Button type="submit" className="w-full">
                  Manage Subscription
                </Button>
              </form>
            ) : (
              <form action={handleCheckout} className="w-full">
                <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                  Upgrade to Premium
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>

      {isPremium && (
        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
            <Crown className="h-5 w-5" />
            <span>You are currently on the Premium plan</span>
          </div>
          <p className="mt-2 text-green-600 dark:text-green-400">
            Your subscription will renew on {new Date(subscription.current_period_end).toLocaleDateString()}.
          </p>
        </div>
      )}
    </div>
  )
}
