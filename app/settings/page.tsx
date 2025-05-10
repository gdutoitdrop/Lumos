"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { ChangePasswordForm } from "@/components/auth/change-password-form"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [success, setSuccess] = useState(false)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    // Save settings logic would go here
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        To change your email, please contact support
                      </p>
                    </div>

                    {success && (
                      <Alert className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        <AlertDescription>Settings saved successfully!</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <ChangePasswordForm />

              <Card>
                <CardHeader>
                  <CardTitle>Delete Account</CardTitle>
                  <CardDescription>Permanently delete your account and all data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Control who can see your profile</p>
                  </div>
                  <div>
                    <select
                      id="profile-visibility"
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="matches">Matches Only</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="online-status">Online Status</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Show when you're active on Lumos</p>
                  </div>
                  <Switch id="online-status" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="read-receipts">Read Receipts</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Let others know when you've read their messages
                    </p>
                  </div>
                  <Switch id="read-receipts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Allow anonymous data to improve Lumos</p>
                  </div>
                  <Switch id="data-sharing" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                  Save Privacy Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-matches">New Matches</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications for new matches</p>
                  </div>
                  <Switch id="new-matches" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-messages">New Messages</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications for new messages</p>
                  </div>
                  <Switch id="new-messages" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="community-activity">Community Activity</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Receive notifications for community posts and events
                    </p>
                  </div>
                  <Switch id="community-activity" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Premium Subscription</CardTitle>
                <CardDescription>Upgrade to Lumos Premium for enhanced features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle>Free Plan</CardTitle>
                      <CardDescription>Your current plan</CardDescription>
                      <div className="mt-2 text-3xl font-bold">$0</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Basic matching
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Community forum access
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Resource hub access
                        </li>
                        <li className="flex items-center text-slate-400">
                          <svg
                            className="mr-2 h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Advanced matching algorithm
                        </li>
                        <li className="flex items-center text-slate-400">
                          <svg
                            className="mr-2 h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          See who liked you
                        </li>
                        <li className="flex items-center text-slate-400">
                          <svg
                            className="mr-2 h-4 w-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Priority support
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-2 border-rose-500 dark:border-rose-700 relative">
                    <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                      RECOMMENDED
                    </div>
                    <CardHeader>
                      <CardTitle>Premium Plan</CardTitle>
                      <CardDescription>Unlock all features</CardDescription>
                      <div className="mt-2 text-3xl font-bold">
                        $9.99<span className="text-sm font-normal">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          All Free features
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Advanced matching algorithm
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Unlimited matches
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          See who liked you
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Priority support
                        </li>
                        <li className="flex items-center">
                          <svg
                            className="mr-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ad-free experience
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                        Upgrade Now
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
