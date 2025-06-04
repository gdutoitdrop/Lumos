import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Users, MessageCircleHeartIcon as MessageHeart, Calendar, Star } from "lucide-react"
import Link from "next/link"

export default function DateModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            Date Mode
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Find meaningful romantic connections with people who understand your mental health journey and share your
            values.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Dating with Understanding</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Traditional dating apps often overlook the importance of mental health compatibility. Lumos Date Mode
              creates connections based on emotional understanding, shared experiences, and genuine empathy.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-rose-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Empathy-First Matching</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Connect with people who truly understand your journey
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-rose-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Safe Space Dating</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Date in an environment that prioritizes mental health
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageHeart className="h-6 w-6 text-rose-500 mt-1" />
                <div>
                  <h3 className="font-semibold">Meaningful Conversations</h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Go beyond small talk with deeper connection tools
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">How Date Mode Works</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <span className="text-rose-500 font-bold">1</span>
                </div>
                <p>Set your dating preferences and mental health compatibility</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <span className="text-rose-500 font-bold">2</span>
                </div>
                <p>Get matched with compatible partners based on understanding</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <span className="text-rose-500 font-bold">3</span>
                </div>
                <p>Start conversations with guided prompts and video dates</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <span className="text-rose-500 font-bold">4</span>
                </div>
                <p>Build meaningful relationships in a supportive environment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-rose-500 mb-2" />
              <CardTitle>Compatibility Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                Our algorithm considers mental health journeys, coping strategies, and emotional needs for better
                matches.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-rose-500 mb-2" />
              <CardTitle>Virtual Date Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                Enjoy guided virtual dates, mindfulness sessions, and activities designed for meaningful connection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Star className="h-8 w-8 text-rose-500 mb-2" />
              <CardTitle>Relationship Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                Access resources and guidance for building healthy relationships while managing mental health.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Find Love with Understanding?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <Link href="/signup">Start Dating on Lumos</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
