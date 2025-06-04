import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Video, Headphones, FileText, Heart, Brain, Phone, Users } from "lucide-react"
import Link from "next/link"

export default function ResourceHubPage() {
  const resourceCategories = [
    {
      title: "Crisis Resources",
      description: "Immediate help and crisis intervention",
      icon: Phone,
      color: "red",
      resources: [
        "24/7 Crisis Hotlines",
        "Emergency Mental Health Services",
        "Suicide Prevention Resources",
        "Crisis Text Lines",
      ],
    },
    {
      title: "Educational Content",
      description: "Learn about mental health conditions and treatments",
      icon: BookOpen,
      color: "blue",
      resources: ["Mental Health Guides", "Condition Information", "Treatment Options", "Research Articles"],
    },
    {
      title: "Self-Care Tools",
      description: "Practical tools for daily mental health management",
      icon: Heart,
      color: "rose",
      resources: ["Mood Tracking Apps", "Meditation Guides", "Breathing Exercises", "Journaling Prompts"],
    },
    {
      title: "Professional Help",
      description: "Find qualified mental health professionals",
      icon: Users,
      color: "green",
      resources: ["Therapist Directory", "Psychiatrist Finder", "Support Groups", "Treatment Centers"],
    },
  ]

  const featuredResources = [
    {
      title: "Understanding Anxiety",
      type: "Article",
      duration: "5 min read",
      icon: FileText,
      description: "A comprehensive guide to understanding anxiety disorders and management techniques.",
    },
    {
      title: "Mindfulness for Beginners",
      type: "Video",
      duration: "15 min",
      icon: Video,
      description: "Learn basic mindfulness techniques to reduce stress and improve mental clarity.",
    },
    {
      title: "Sleep and Mental Health",
      type: "Podcast",
      duration: "30 min",
      icon: Headphones,
      description: "Explore the connection between sleep quality and mental health outcomes.",
    },
    {
      title: "Coping with Depression",
      type: "Guide",
      duration: "10 min read",
      icon: BookOpen,
      description: "Practical strategies for managing depression symptoms and building resilience.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Resource Hub
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Access curated mental health resources, educational content, and professional support to help you on your
            journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {resourceCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className={`h-8 w-8 text-${category.color}-500`} />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.resources.map((resource, idx) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <div className={`w-2 h-2 bg-${category.color}-500 rounded-full`}></div>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredResources.map((resource, index) => {
              const IconComponent = resource.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-blue-500" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{resource.type}</Badge>
                          <span className="text-sm text-slate-500">{resource.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">{resource.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-16 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              If you're in crisis or need immediate support, these resources are available 24/7.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <CardTitle className="text-red-600 dark:text-red-400">Crisis Hotline</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">988</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Suicide & Crisis Lifeline</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-blue-600 dark:text-blue-400">Crisis Text Line</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-bold mb-2">Text HOME to 741741</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">24/7 Crisis Support</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-green-600 dark:text-green-400">Emergency Services</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">911</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Immediate Emergency</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Explore More Resources</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <Link href="/resources">Browse All Resources</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/community">Join Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
