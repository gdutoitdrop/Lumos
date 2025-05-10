"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

export default function AuthTestPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const createTestUser = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/auth-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create-test-user",
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create test user")
      }

      setResult(data)
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testLogin = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Login successful",
        user: data.user,
        session: {
          ...data.session,
          access_token: data.session?.access_token ? "[REDACTED]" : null,
          refresh_token: data.session?.refresh_token ? "[REDACTED]" : null,
        },
      })
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An unexpected error occurred")
      setResult({
        success: false,
        error: err,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setResult({
        success: true,
        message: "Logged out successfully",
      })
    } catch (err: any) {
      setError(err.message || "Failed to log out")
    } finally {
      setIsLoading(false)
    }
  }

  const checkSession = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: data.session ? "Active session found" : "No active session",
        session: data.session
          ? {
              ...data.session,
              access_token: "[REDACTED]",
              refresh_token: "[REDACTED]",
            }
          : null,
        user: data.session?.user,
      })
    } catch (err: any) {
      console.error("Session check error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Testing Tools</CardTitle>
          <CardDescription>Development tools for testing authentication flows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={createTestUser} disabled={isLoading} variant="outline">
              Create Test User
            </Button>
            <Button onClick={testLogin} disabled={isLoading} variant="default">
              Test Login
            </Button>
            <Button onClick={logout} disabled={isLoading} variant="destructive">
              Logout
            </Button>
            <Button onClick={checkSession} disabled={isLoading} variant="secondary">
              Check Session
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-slate-500">These tools are only available in development mode</p>
        </CardFooter>
      </Card>
    </div>
  )
}
