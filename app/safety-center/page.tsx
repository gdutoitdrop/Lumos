import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Eye, Lock, UserX, Flag, Phone, Heart } from "lucide-react"
import Link from "next/link"

export default function SafetyCenterPage() {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "Profile Verification",
      description: "All profiles go through verification to ensure authentic connections.",
    },
    {
      icon: Eye,
      title: "Privacy Controls",
      description: "Control who can see your profile and personal information.",
    },
    {
      icon: Lock,
      title: "Secure Messaging",
      description: "All messages are encrypted and stored securely.",
    },
    {
      icon: UserX,
      title: "Block & Report",
      description: "Easily block users and report inappropriate behavior.",
    },
    {
      icon: Flag,
      title: "Content Moderation",
      description: "AI and human moderators review content for safety.",
    },
    {
      icon: Heart,
      title: "Mental Health Support",
      description: "Access to crisis resources and professional support.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            Safety Center
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Your safety and well-being are our top priorities. Learn about our safety features and how to stay safe on
            Lumos.
          </p>
        </div>

        <Alert className="mb-12 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            <strong>Crisis Support:</strong> If you're in immediate danger or having thoughts of self-harm, please call
            988 (Suicide & Crisis Lifeline) or your local emergency services.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {safetyFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Safety Guidelines</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Protect Your Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">
                    • Never share your full name, address, or phone number in your profile
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    • Use the platform's messaging system instead of personal contact methods
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    • Be cautious about sharing photos that reveal your location
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">• Keep financial information private</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Safely</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-600 dark:text-slate-300">
                    • Start with video calls before meeting in person
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">• Meet in public places for first meetings</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    • Tell a friend or family member about your plans
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    • Trust your instincts - if something feels wrong, leave
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Report & Block</h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">How to Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm font-bold">1</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Click the three dots menu on any profile or message
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm font-bold">2</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Select "Report" and choose the reason</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm font-bold">3</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Provide additional details if needed</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-500 text-sm font-bold">4</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Our team will review within 24 hours</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What to Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-slate-600 dark:text-slate-300">• Harassment or bullying</p>
                <p className="text-slate-600 dark:text-slate-300">• Inappropriate sexual content</p>
                <p className="text-slate-600 dark:text-slate-300">• Fake profiles or catfishing</p>
                <p className="text-slate-600 dark:text-slate-300">• Spam or scam attempts</p>
                <p className="text-slate-600 dark:text-slate-300">• Threats or violence</p>
                <p className="text-slate-600 dark:text-slate-300">• Underage users</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-16 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Crisis Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <CardTitle className="text-red-600 dark:text-red-400">Suicide Prevention</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">988</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">24/7 Crisis Lifeline</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <Heart className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-blue-600 dark:text-blue-400">Crisis Text Line</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-bold mb-2">Text HOME to 741741</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">24/7 Text Support</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <CardTitle className="text-green-600 dark:text-green-400">Emergency</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">911</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Immediate Emergency</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Need Help or Have Questions?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <Link href="/report-issue">Report an Issue</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/help-center">Visit Help Center</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
