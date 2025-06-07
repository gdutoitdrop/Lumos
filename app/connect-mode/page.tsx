import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, MessageCircle, Shield, Lightbulb, Coffee } from "lucide-react"
import Link from "next/link"

export default function ConnectModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Connect Mode
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Build meaningful friendships and support networks with people who understand your journey and share your
            experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Friendship Through Understanding</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Connect Mode focuses on building genuine friendships and support networks. Find people who share your
              interests, understand your challenges, and can offer mutual support on your mental health journey.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Supportive Community</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Connect with people who truly get what you're going through
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Shared Experiences</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Bond over similar mental health journeys and coping strategies
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Safe Conversations</h3>
                  <p className="text-slate-600 dark:text-slate-300">Discuss mental health openly without judgment</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">How Connect Mode Works</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold">1</span>
                </div>
                <p>Share your interests, hobbies, and support needs</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold">2</span>
                </div>
                <p>Get matched with potential friends based on compatibility</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold">3</span>
                </div>
                <p>Join group activities and one-on-one conversations</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold">4</span>
                </div>
                <p>Build lasting friendships and support networks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Peer Support Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                Join moderated support groups for specific mental health topics and shared experiences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Coffee className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Virtual Hangouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                Participate in virtual coffee chats, book clubs, and hobby groups with like-minded friends.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lightbulb className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Skill Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                Share coping strategies, learn new skills, and grow together in a supportive environment.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Build Your Support Network?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <Link href="/signup">Start Connecting</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/community">Explore Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
