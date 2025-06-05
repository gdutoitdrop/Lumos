import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Book, Video, Phone, Mail, Shield } from "lucide-react"
import Link from "next/link"

export default function HelpCenterPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        "How do I create an account?",
        "How does the matching system work?",
        "What are the different modes?",
        "How do I set up my profile?",
      ],
    },
    {
      title: "Privacy & Safety",
      questions: [
        "How is my data protected?",
        "How do I report inappropriate behavior?",
        "Can I block other users?",
        "What information is visible to others?",
      ],
    },
    {
      title: "Features & Tools",
      questions: [
        "How do video calls work?",
        "How do I join community forums?",
        "What are mental health badges?",
        "How do I access resources?",
      ],
    },
    {
      title: "Account Management",
      questions: [
        "How do I change my password?",
        "How do I delete my account?",
        "How do I update my preferences?",
        "How do I manage notifications?",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Find answers to your questions and get the support you need to make the most of Lumos.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input placeholder="Search for help articles, guides, and FAQs..." className="pl-12 h-12 text-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {faqCategories.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.questions.map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <p className="text-slate-700 dark:text-slate-300">{question}</p>
                          <Badge variant="outline">View</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Need personalized help? Reach out to our support team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Live Chat
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/community-guidelines"
                  className="block p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-blue-500" />
                    <span>Community Guidelines</span>
                  </div>
                </Link>
                <Link href="/safety-center" className="block p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Safety Center</span>
                  </div>
                </Link>
                <Link href="/resource-hub" className="block p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span>Resource Hub</span>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <Video className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">Getting Started Guide</p>
                    <p className="text-sm text-slate-500">5 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <Video className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">Profile Setup</p>
                    <p className="text-sm text-slate-500">3 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <Video className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">Using Video Calls</p>
                    <p className="text-sm text-slate-500">4 min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Still Need Help?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/community">Ask the Community</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
