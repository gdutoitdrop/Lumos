import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
            How Lumos Works
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Discover how our platform creates meaningful connections through empathy, understanding, and shared
            experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-rose-200 dark:border-rose-800">
            <CardHeader>
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <CardTitle>1. Create Your Profile</CardTitle>
              <CardDescription>
                Share your story, mental health journey, and what you're looking for in connections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>• Express your authentic self</li>
                <li>• Set your mental health badges</li>
                <li>• Choose your connection preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle>2. Find Your Matches</CardTitle>
              <CardDescription>
                Our algorithm connects you with people who understand your journey and share similar experiences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>• Mood-aware matching</li>
                <li>• Shared interest connections</li>
                <li>• Support-based pairing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>3. Connect & Communicate</CardTitle>
              <CardDescription>
                Start conversations, join video calls, and build meaningful relationships in a safe environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>• Secure messaging</li>
                <li>• Video & voice calls</li>
                <li>• Community forums</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-16 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Two Modes of Connection</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Date Mode</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Find romantic connections with people who understand your mental health journey.
              </p>
              <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                Romantic Connections
              </Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Connect Mode</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Build friendships and support networks with like-minded individuals.
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Friendship & Support
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Start Your Journey?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
              <Link href="/signup">Join Lumos Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
