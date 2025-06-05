import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Heart, Shield, Lightbulb, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CommunityForumsPage() {
  const forumCategories = [
    {
      name: "Anxiety Support",
      description: "Share experiences and coping strategies for anxiety",
      members: 1247,
      posts: 3421,
      icon: Heart,
      color: "rose",
    },
    {
      name: "Depression Resources",
      description: "Support and resources for managing depression",
      members: 892,
      posts: 2156,
      icon: Lightbulb,
      color: "blue",
    },
    {
      name: "Mindfulness & Meditation",
      description: "Discuss mindfulness practices and meditation techniques",
      members: 634,
      posts: 1789,
      icon: BookOpen,
      color: "green",
    },
    {
      name: "Relationship Support",
      description: "Navigate relationships while managing mental health",
      members: 567,
      posts: 1432,
      icon: Users,
      color: "purple",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Community Forums
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Join supportive discussions, share your experiences, and learn from others on similar mental health
            journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Forum Categories</h2>
            <div className="space-y-6">
              {forumCategories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center`}
                        >
                          <IconComponent className={`h-6 w-6 text-${category.color}-500`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{category.name}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">{category.members} members</p>
                          <p className="text-sm text-slate-500">{category.posts} posts</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Forum Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">Be respectful and supportive</p>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-rose-500 mt-0.5" />
                  <p className="text-sm">Share experiences, not advice</p>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  <p className="text-sm">Maintain confidentiality</p>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                  <p className="text-sm">Use trigger warnings when needed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-rose-500 pl-4">
                  <p className="font-medium text-sm">New post in Anxiety Support</p>
                  <p className="text-xs text-slate-500">2 minutes ago</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-sm">Discussion in Depression Resources</p>
                  <p className="text-xs text-slate-500">15 minutes ago</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-sm">New member joined Mindfulness</p>
                  <p className="text-xs text-slate-500">1 hour ago</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-16 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Why Join Our Forums?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Peer Support</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Connect with others who understand your experiences and challenges.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Shared Wisdom</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Learn coping strategies and insights from community members.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe Space</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Discuss mental health topics in a moderated, supportive environment.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Join the Conversation?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Link href="/community">Explore Forums</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
