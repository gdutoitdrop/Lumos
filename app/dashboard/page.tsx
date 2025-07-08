import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, MessageCircle, BookOpen, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Lumos</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Your journey to meaningful connections and mental wellness starts here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-lg">Find Connections</CardTitle>
              </div>
              <CardDescription>Discover people who understand your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/matching">Start Matching</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Join Community</CardTitle>
              </div>
              <CardDescription>Connect with supportive community forums</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/community">Explore Forums</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Messages</CardTitle>
              </div>
              <CardDescription>Chat with your connections</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg">Resources</CardTitle>
              </div>
              <CardDescription>Access mental health resources and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/resources">Browse Resources</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Track Progress</CardTitle>
              </div>
              <CardDescription>Monitor your mental health journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-lg">Settings</CardTitle>
              </div>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings">Open Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Complete your profile to start connecting with others who share your journey.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/profile">Complete Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
