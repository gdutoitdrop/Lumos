import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your device when you visit our website. They help us
                provide you with a better experience by remembering your preferences and understanding how you use our
                platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function properly. They enable core functionality such
                  as security, network management, and accessibility.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Examples:</strong> Authentication tokens, session management, security features
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-blue-600">Functional Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies allow us to remember choices you make and provide enhanced, more personal features.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Examples:</strong> Language preferences, theme settings, notification preferences
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-purple-600">Analytics Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies help us understand how visitors interact with our website by collecting and reporting
                  information anonymously.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Examples:</strong> Page views, user flow, feature usage statistics
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-amber-600">Performance Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies collect information about how you use our website to help us improve its performance.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Examples:</strong> Loading times, error tracking, optimization data
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managing Your Cookie Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Browser Settings</h3>
                <p className="text-muted-foreground">
                  Most web browsers allow you to control cookies through their settings. You can usually find these
                  settings in the "Options" or "Preferences" menu of your browser.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Platform Settings</h3>
                <p className="text-muted-foreground">
                  You can manage your cookie preferences for non-essential cookies through your account settings when
                  you're logged in to Lumos.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Note:</strong> Disabling certain cookies may affect the functionality of our platform and your
                  user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We may use third-party services that set their own cookies. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Authentication Services:</strong> For secure login and account management
                </li>
                <li>
                  <strong>Analytics Providers:</strong> To understand platform usage and improve our services
                </li>
                <li>
                  <strong>Content Delivery Networks:</strong> To ensure fast and reliable content delivery
                </li>
                <li>
                  <strong>Customer Support Tools:</strong> To provide better support experiences
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new
                policy on this page.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p className="font-semibold">Email: privacy@lumos.com</p>
                <p className="font-semibold">Subject: Cookie Policy Inquiry</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
