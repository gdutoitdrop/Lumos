import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Shield, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            About Lumos
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            We're building a world where mental health challenges don't have to be faced alone. Lumos creates meaningful
            connections through empathy, understanding, and shared experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300">
              <p>
                Lumos was born from a simple yet powerful realization: traditional social platforms often fail to
                address the unique needs of people navigating mental health challenges.
              </p>
              <p>
                We believe that meaningful connections are built on understanding, empathy, and shared experiences. Our
                platform is designed specifically for individuals who want to connect with others who truly "get it" –
                people who understand the complexities of mental health journeys.
              </p>
              <p>
                Named after the spell that brings light to darkness, Lumos represents hope, connection, and the power of
                community in overcoming life's challenges.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Our Values</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Heart className="h-6 w-6 text-rose-500 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Empathy First</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Every feature is designed with compassion and understanding at its core.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Safety & Privacy</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Your mental health journey is personal, and we protect it with the highest standards.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Authentic Connection</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    We foster genuine relationships built on mutual understanding and support.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Lightbulb className="h-6 w-6 text-amber-500 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Continuous Growth</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    We're always learning and evolving to better serve our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-blue-500">10K+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">Meaningful Connections</p>
                <p className="text-slate-600 dark:text-slate-300">
                  People have found understanding and support through our platform
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-green-500">95%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">Feel More Supported</p>
                <p className="text-slate-600 dark:text-slate-300">
                  Of users report feeling less alone in their mental health journey
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-purple-500">24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">Community Support</p>
                <p className="text-slate-600 dark:text-slate-300">
                  Our community provides round-the-clock peer support and understanding
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Join Our Mission</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Together, we can create a world where no one has to face their mental health challenges alone. Join
            thousands of others who have found their community on Lumos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Link href="/signup">Join Lumos Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
