import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using Lumos, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lumos is designed to create meaningful connections for individuals navigating mental health challenges.
                Our platform facilitates both romantic connections (Date Mode) and friendships (Connect Mode) in a safe,
                supportive environment that prioritizes mental wellbeing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Security</h3>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account and password and for
                    restricting access to your computer.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Truthful Information</h3>
                  <p className="text-muted-foreground">
                    You agree to provide accurate, current, and complete information about yourself as prompted by our
                    registration forms.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Respectful Behavior</h3>
                  <p className="text-muted-foreground">
                    You agree to treat all users with respect, empathy, and understanding, especially regarding mental
                    health topics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The following activities are strictly prohibited:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Harassment, bullying, or discrimination of any kind</li>
                <li>Sharing false or misleading information about mental health</li>
                <li>Attempting to provide professional medical or therapeutic advice</li>
                <li>Sharing explicit or inappropriate content</li>
                <li>Creating fake profiles or impersonating others</li>
                <li>Spamming or soliciting other users</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mental Health Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Important:</strong> Lumos is not a substitute for professional mental health care. While our
                  platform facilitates peer support and connection, it does not provide medical advice, diagnosis, or
                  treatment. Always consult with qualified healthcare professionals for mental health concerns.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crisis Situations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                <p className="text-muted-foreground mb-4">
                  <strong>If you are experiencing a mental health crisis:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Contact emergency services (911) immediately</li>
                  <li>Call the National Suicide Prevention Lifeline: 988</li>
                  <li>Text "HELLO" to 741741 for the Crisis Text Line</li>
                  <li>Go to your nearest emergency room</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lumos shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                resulting from your use of the platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p className="font-semibold">Email: legal@lumos.com</p>
                <p className="font-semibold">Address: 123 Wellness Street, Mental Health City, MH 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
