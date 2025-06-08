"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PaymentForm } from "@/components/premium/payment-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "premium_plus" | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const router = useRouter()

  const plans = [
    {
      id: "premium" as const,
      name: "Premium",
      price: "$9.99",
      period: "month",
      features: [
        "See who liked you",
        "Unlimited matches",
        "Advanced messaging",
        "Super likes (5 per day)",
        "Profile boost",
        "Priority support",
      ],
      popular: true,
    },
    {
      id: "premium_plus" as const,
      name: "Premium Plus",
      price: "$19.99",
      period: "month",
      features: [
        "All Premium features",
        "Exclusive events access",
        "AI conversation starter",
        "Advanced analytics",
        "Personal matchmaker",
        "Premium-only community",
      ],
      popular: false,
    },
  ]

  const handlePlanSelect = (planId: "premium" | "premium_plus") => {
    setSelectedPlan(planId)
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    router.push("/premium?success=true")
  }

  if (showPayment && selectedPlan) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setShowPayment(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to plans
            </Button>
          </div>
          <PaymentForm planType={selectedPlan} onSuccess={handlePaymentSuccess} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features and enhance your mental health journey with deeper connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-rose-500 shadow-lg" : ""} hover:shadow-lg transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-rose-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription>Perfect for serious connections</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                      : ""
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
