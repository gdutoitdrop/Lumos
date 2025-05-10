"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SubscribeButton } from "@/components/subscription/subscribe-button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

type Subscription = {
  id: string
  plan_type: string
  status: string
  current_period_end: string
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("subscriptions").select("*").eq("profile_id", user.id).single()

        if (error) {
          if (error.code !== "PGRST116") {
            // PGRST116 is the error code for "no rows returned"
            console.error("Error fetching subscription:", error)
          }
        } else {
          setSubscription(data)
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isActive = subscription?.status === "active" || subscription?.status === "trialing"

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Subscription</h1>

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your subscription has been processed successfully. It may take a few moments to be reflected in your
              account.
            </AlertDescription>
          </Alert>
        )}

        {canceled && (
          <Alert className="mb-6 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Canceled</AlertTitle>
            <AlertDescription>You've canceled the subscription process. No charges have been made.</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : (
          <>
            {isActive ? (
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Plan</h3>
                      <p>{subscription?.plan_type || "Premium"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        <span className="capitalize">{subscription?.status}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Current Period Ends</h3>
                      <p>{formatDate(subscription?.current_period_end || "")}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Manage Subscription</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Free Plan</CardTitle>
                    <CardDescription>Your current plan</CardDescription>
                    <div className="mt-2 text-3xl font-bold">$0</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Basic matching
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Community forum access
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Resource hub access
                      </li>
                      <li className="flex items-center text-slate-400">
                        <svg
                          className="mr-2 h-4 w-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Advanced matching algorithm
                      </li>
                      <li className="flex items-center text-slate-400">
                        <svg
                          className="mr-2 h-4 w-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        See who liked you
                      </li>
                      <li className="flex items-center text-slate-400">
                        <svg
                          className="mr-2 h-4 w-4 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Priority support
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-2 border-rose-500 dark:border-rose-700 relative">
                  <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                    RECOMMENDED
                  </div>
                  <CardHeader>
                    <CardTitle>Premium Plan</CardTitle>
                    <CardDescription>Unlock all features</CardDescription>
                    <div className="mt-2 text-3xl font-bold">
                      $9.99<span className="text-sm font-normal">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All Free features
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced matching algorithm
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Unlimited matches
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        See who liked you
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ad-free experience
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <SubscribeButton
                      plan="PREMIUM"
                      className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                    >
                      Upgrade Now
                    </SubscribeButton>
                  </CardFooter>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
