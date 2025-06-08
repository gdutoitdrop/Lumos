"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Eye, MessageCircle, Heart, Shield, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"

interface PremiumFeaturesProps {
  showUpgrade?: boolean
}

export function PremiumFeatures({ showUpgrade = true }: PremiumFeaturesProps) {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return

      const { data } = await supabase.from("user_subscriptions").select("*").eq("user_id", user.id).single()

      setSubscription(data)
      setLoading(false)
    }

    fetchSubscription()
  }, [user, supabase])

  const isPremium = subscription?.plan_type === "premium" || subscription?.plan_type === "premium_plus"
  const isPremiumPlus = subscription?.plan_type === "premium_plus"

  const features = [
    {
      icon: Eye,
      title: "See Who Liked You",
      description: "View all profiles that have liked you before matching",
      tier: "premium",
      available: isPremium,
    },
    {
      icon: Zap,
      title: "Unlimited Matches",
      description: "No daily limits on likes and matches",
      tier: "premium",
      available: isPremium,
    },
    {
      icon: MessageCircle,
      title: "Advanced Messaging",
      description: "Send messages before matching, read receipts, and message reactions",
      tier: "premium",
      available: isPremium,
    },
    {
      icon: Heart,
      title: "Super Likes",
      description: "Stand out with 5 super likes per day",
      tier: "premium",
      available: isPremium,
    },
    {
      icon: Sparkles,
      title: "Profile Boost",
      description: "Get 2x more profile views with weekly boosts",
      tier: "premium",
      available: isPremium,
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get faster response times from our support team",
      tier: "premium",
      available: isPremium,
    },
    {
      icon: Crown,
      title: "Exclusive Events",
      description: "Access to premium-only virtual and local events",
      tier: "premium_plus",
      available: isPremiumPlus,
    },
    {
      icon: Zap,
      title: "AI Conversation Starter",
      description: "Get personalized conversation suggestions powered by AI",
      tier: "premium_plus",
      available: isPremiumPlus,
    },
  ]

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Basic matching", "5 likes per day", "Community forum access", "Resource hub access"],
      current: !isPremium,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "month",
      features: [
        "All Free features",
        "See who liked you",
        "Unlimited matches",
        "Advanced messaging",
        "Super likes",
        "Profile boost",
        "Priority support",
      ],
      current: isPremium && !isPremiumPlus,
      popular: true,
    },
    {
      name: "Premium Plus",
      price: "$19.99",
      period: "month",
      features: [
        "All Premium features",
        "Exclusive events",
        "AI conversation starter",
        "Advanced analytics",
        "Personal matchmaker",
      ],
      current: isPremiumPlus,
    },
  ]

  if (loading) {
    return <div className="text-center py-8">Loading subscription details...</div>
  }

  return (
    <div className="space-y-8">
      {/* Current Features */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Premium Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`${feature.available ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "opacity-60"}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${feature.available ? "text-green-600" : "text-gray-400"}`} />
                    <CardTitle className="text-sm">{feature.title}</CardTitle>
                    {feature.available && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Upgrade Plans */}
      {showUpgrade && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Upgrade Your Plan</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.current ? "ring-2 ring-blue-500" : ""} ${plan.popular ? "border-rose-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-rose-500 text-white">Most Popular</Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${plan.current ? "opacity-50" : plan.popular ? "bg-rose-500 hover:bg-rose-600" : ""}`}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
