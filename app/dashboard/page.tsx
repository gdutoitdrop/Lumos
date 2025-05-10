import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Users, BookOpen } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Welcome to Lumos</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Heart className="mr-2 h-5 w-5 text-rose-500" />
                Date Mode
              </CardTitle>
              <CardDescription>Find romantic connections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Connect with others looking for meaningful romantic relationships.
              </p>
              <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white">Explore</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Connect Mode
              </CardTitle>
              <CardDescription>Build friendships</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Find friends who understand your experiences and journey.
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">Explore</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-emerald-500" />
                Messages
              </CardTitle>
              <CardDescription>Your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Continue your conversations with matches and friends.
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
                Resources
              </CardTitle>
              <CardDescription>Mental health support</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Access helpful resources, tools, and exercises.
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/resources">Browse Resources</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Community Activity</CardTitle>
              <CardDescription>Recent discussions and posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Anxiety Support Group</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        New post: Coping strategies for social anxiety
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="text-rose-500 p-0">
                    View Discussion
                  </Button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Mindfulness Practice</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        New event: Virtual meditation session this Friday
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="text-rose-500 p-0">
                    Join Event
                  </Button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Depression Support</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        New post: Small victories celebration thread
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="text-rose-500 p-0">
                    View Discussion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Help others connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Information</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                      <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Basic information
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                      <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Profile picture
                  </li>
                  <li className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-2">
                      <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    Mental health journey
                  </li>
                  <li className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-2">
                      <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    Add mental health badges
                  </li>
                </ul>

                <Button className="w-full" asChild>
                  <Link href="/profile">Complete Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
