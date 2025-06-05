import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, MessageCircle, BookOpen, Shield, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How Lumos Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our platform creates meaningful connections while prioritizing your mental health and
            wellbeing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Heart className="h-12 w-12 text-rose-500 mb-4" />
              <CardTitle>1. Create Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build an authentic profile that reflects your personality, interests, and mental health journey. Share
                what matters to you.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-12 w-12 text-amber-500 mb-4" />
              <CardTitle>2. Smart Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our algorithm considers compatibility, shared experiences, and current emotional states to suggest
                meaningful connections.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-blue-500 mb-4" />
              <CardTitle>3. Connect & Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start conversations with tone-sensitive messaging that helps maintain positive, supportive
                communication.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-green-500 mb-4" />
              <CardTitle>4. Join Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Participate in moderated forums and support groups focused on specific mental health topics and shared
                interests.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-purple-500 mb-4" />
              <CardTitle>5. Access Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Explore curated mental health content, coping tools, and crisis resources to support your wellbeing
                journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-slate-500 mb-4" />
              <CardTitle>6. Stay Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Benefit from comprehensive safety features, reporting tools, and moderation to ensure a secure
                experience.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 text-white" asChild>
            <Link href="/signup">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
