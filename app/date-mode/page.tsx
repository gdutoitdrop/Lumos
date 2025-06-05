import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, MessageCircle, Shield } from "lucide-react"
import Link from "next/link"

export default function DateModePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Heart className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Date Mode</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find romantic connections with people who understand your mental health journey. Build meaningful
            relationships based on empathy, understanding, and shared experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Date Mode is Different</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Sparkles className="h-6 w-6 text-amber-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Empathy-First Matching</h3>
                  <p className="text-muted-foreground">
                    Our algorithm prioritizes emotional compatibility and understanding over superficial traits.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MessageCircle className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Supportive Communication</h3>
                  <p className="text-muted-foreground">
                    AI-assisted messaging helps maintain positive, understanding conversations.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Shield className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Safe Environment</h3>
                  <p className="text-muted-foreground">
                    Comprehensive safety features and moderation ensure a secure dating experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share your mental health journey through optional badges that help others understand your experiences
                  and needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mood-Aware Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our system considers your current emotional state to suggest connections at the right time for both of
                  you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Clearly define what you're looking for, from casual dating to long-term relationships, with mental
                  health considerations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/20 dark:to-amber-950/20 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Love?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of people who have found meaningful romantic connections through understanding and empathy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 text-white" asChild>
              <Link href="/signup">Start Dating</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
