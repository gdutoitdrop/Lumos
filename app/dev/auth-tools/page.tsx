"use client"

import { useEffect, useState } from "react"
import { ManualConfirm } from "@/components/auth/manual-confirm"
import { DebugAuth } from "@/components/auth/debug-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthToolsPage() {
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
      setIsDevMode(true)
    }
  }, [])

  if (!isDevMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is only available in development mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Auth Development Tools</h1>
          <p className="text-slate-600 dark:text-slate-300">
            These tools are only available in development mode and should never be used in production.
          </p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <DebugAuth />
          <ManualConfirm />

          <Card>
            <CardHeader>
              <CardTitle>Email Testing Setup Guide</CardTitle>
              <CardDescription>How to set up Mailtrap for testing email verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Sign up for a free account at{" "}
                  <a
                    href="https://mailtrap.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-500 hover:underline"
                  >
                    Mailtrap.io
                  </a>
                </li>
                <li>Create a new inbox in your Mailtrap account</li>
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to Authentication → Email Templates</li>
                <li>Click on "Email Settings"</li>
                <li>
                  Select "Custom SMTP" and enter your Mailtrap SMTP credentials:
                  <ul className="list-disc pl-5 mt-2">
                    <li>Host: smtp.mailtrap.io</li>
                    <li>Port: 2525 (or as provided by Mailtrap)</li>
                    <li>Username: [Your Mailtrap inbox username]</li>
                    <li>Password: [Your Mailtrap inbox password]</li>
                  </ul>
                </li>
                <li>Save the settings</li>
                <li>Now all verification emails will be captured in your Mailtrap inbox</li>
              </ol>

              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                <h3 className="font-medium mb-2">Alternative: Use Supabase Local Development</h3>
                <p className="text-sm mb-2">
                  If you're using Supabase CLI for local development, you can view all emails in the local dashboard:
                </p>
                <ol className="list-decimal pl-5 text-sm">
                  <li>Install Supabase CLI</li>
                  <li>
                    Run <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">supabase start</code>
                  </li>
                  <li>
                    Access the local dashboard at{" "}
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">http://localhost:54323</code>
                  </li>
                  <li>Go to Authentication → Users to see all emails sent</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
