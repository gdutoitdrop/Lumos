"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ModeSelector } from "@/components/matching/mode-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Sparkles } from "lucide-react"

export default function ModeSelectionPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Connection Modes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lumos offers different ways to connect based on what you're looking for. Choose the mode that best fits your
            goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <CardTitle>Date Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Perfect for finding romantic connections with people who understand your mental health journey. Build
                relationships based on empathy and shared experiences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Connect Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ideal for building friendships and support networks. Connect with like-minded individuals for platonic
                relationships and mutual support.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Both Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Open to all types of connections. This flexible approach allows you to meet people for both romantic and
                platonic relationships.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <ModeSelector />
      </div>
    </DashboardLayout>
  )
}
