"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { PLANS } from "@/lib/stripe"
import { toast } from "@/components/ui/use-toast"

interface SubscriptionCardProps {
  plan: keyof typeof PLANS
  isCurrentPlan?: boolean
}

export function SubscriptionCard({ plan, isCurrentPlan = false }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const planDetails = PLANS[plan]

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          returnUrl: window.location.href,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{planDetails.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">{planDetails.price}</span>
          <span className="text-sm text-muted-foreground">/{planDetails.interval}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {planDetails.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
        >
          {isLoading ? "Processing..." : isCurrentPlan ? "Current Plan" : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  )
}
