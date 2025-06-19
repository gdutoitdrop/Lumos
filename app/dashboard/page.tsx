"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SystemHealthCheck } from "@/components/system-health-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { Heart, MessageCircle, Users, BookOpen, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  const quickActions = [
    {
      title: "Find New Matches",
      description: "Discover people who share your journey",
      icon: Heart,
      href: "/matching",
      color: "from-rose-500 to-pink-500",
    },
    {
      title: "Check Messages",
      description: "Connect with your matches",
      icon: MessageCircle,
      href: "/messages",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Join Community",
      description: "Participate in forum discussions",
      icon: Users,
      href: "/community",
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "Explore Resources",
      description: "Access mental health resources",
      icon: BookOpen,
      href: "/resources",
      color: "from-green-500 to-emerald-500",
    },
  ]

  const stats = [
    { label: "Profile Completion", value: "85%", icon: TrendingUp },
    { label: "Days Active", value: "12", icon: Calendar },
    { label: "Connections Made", value: "3", icon: Heart },
    { label: "Forum Posts", value: "5", icon: MessageCircle },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend"}! 👋
          </h1>
          <p className="text-rose-100 mb-4">
            Ready to continue your mental health journey? Here's what's happening today.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              🌟 Daily Check-in Available
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              💬 2 New Messages
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              🎯 3 New Matches
            </Badge>
          </div>
        </div>

        {/* System Health Check */}
        <SystemHealthCheck />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <div className="flex items-center text-sm text-primary">
                      Get started
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>People you might want to connect with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <p className="font-medium">Sample User {i}</p>
                        <p className="text-sm text-muted-foreground">92% match</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" asChild>
                <Link href="/matching">View All Matches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forum Activity</CardTitle>
              <CardDescription>Latest discussions in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Managing anxiety in social situations",
                  "Meditation techniques that work",
                  "Building healthy relationships",
                ].map((topic, i) => (
                  <div key={i} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">{topic}</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago • 5 replies</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" asChild>
                <Link href="/community">Join Discussions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
