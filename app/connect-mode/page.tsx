import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Heart, MessageCircle, BookOpen, Calendar, Coffee } from "lucide-react"
import Link from "next/link"

export default function ConnectModePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Users className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Connect Mode</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build meaningful friendships and support networks with people who truly understand your mental health
            journey. Find your tribe of supportive, empathetic friends.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Coffee className="h-12 w-12 text-amber-500 mb-4" />
              <CardTitle>Friendship First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with people looking for genuine friendships, support, and understanding without romantic
                pressure.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-12 w-12 text-rose-500 mb-4" />
              <CardTitle>Support Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build a circle of friends who understand your mental health challenges and can provide mutual support.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-green-500 mb-4" />
              <CardTitle>Group Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join group chats, virtual events, and local meetups designed for people with shared mental health
                experiences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Types of Connections</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">Peer Support</h3>
                <p className="text-muted-foreground">
                  Connect with others who share similar mental health experiences for mutual understanding and support.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">Activity Partners</h3>
                <p className="text-muted-foreground">
                  Find friends to share hobbies, interests, and activities that support your wellbeing.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">Accountability Buddies</h3>
                <p className="text-muted-foreground">
                  Partner with someone to help each other maintain healthy habits and reach personal goals.
                </p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold mb-2">Local Community</h3>
                <p className="text-muted-foreground">
                  Connect with people in your area for in-person support and friendship opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Shared Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect over books, movies, music, art, fitness, mindfulness, and other activities that bring you joy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Virtual & Local Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join online support groups, virtual coffee chats, local meetups, and wellness activities in your
                  community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Group Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Participate in moderated group discussions, peer support circles, and community challenges focused on
                  mental wellness.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Your Support Network</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join a community where friendship is built on understanding, empathy, and shared experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-green-500 text-white" asChild>
              <Link href="/signup">Start Connecting</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/community">Explore Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
