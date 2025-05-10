"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

export function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  const supabase = createClient()

  // Only show in development
  useEffect(() => {
    // Check if we're in development mode
    if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
      setShowDebug(true)
    }
  }, [])

  const checkAuthSession = async () => {
    const { data } = await supabase.auth.getSession()
    setDebugInfo(data)
  }

  const listUsers = async () => {
    try {
      // This will only work if you have admin privileges
      const { data, error } = await supabase.from("profiles").select("*").limit(5)

      if (error) throw error

      setDebugInfo({
        message: "Recent users in the profiles table:",
        users: data,
      })
    } catch (error: any) {
      setDebugInfo({
        error: true,
        message: error.message,
      })
    }
  }

  if (!showDebug) return null

  return (
    <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 mt-4">
      <CardHeader>
        <CardTitle className="text-amber-800 dark:text-amber-300">Auth Debug Mode</CardTitle>
        <CardDescription>
          This panel is only visible in development mode and helps debug authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={checkAuthSession}
            className="bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
          >
            Check Auth Session
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={listUsers}
            className="bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
          >
            List Recent Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugInfo(null)}
            className="bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800"
          >
            Clear
          </Button>
        </div>

        {debugInfo && (
          <Alert className="bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800">
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-sm text-amber-700 dark:text-amber-400">
          <p>Troubleshooting tips:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Check Supabase dashboard for user confirmation status</li>
            <li>Verify email templates in Supabase Authentication settings</li>
            <li>Check spam folders for verification emails</li>
            <li>Try using a test email service like Mailtrap</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
