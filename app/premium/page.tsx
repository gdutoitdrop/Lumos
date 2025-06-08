"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PremiumFeatures } from "@/components/premium/premium-features"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Sparkles, Heart } from "lucide-react"

export default function PremiumPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Lumos Premium</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of meaningful connections with premium features designed for deeper relationships.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Enhanced Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced algorithms and unlimited matches help you find the perfect connections faster.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <CardTitle>Deeper Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Premium messaging features and conversation starters help build more meaningful relationships.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle>Exclusive Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join premium-only events, get priority support, and access exclusive mental health resources.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <PremiumFeatures />
      </div>
    </DashboardLayout>
  )
}
