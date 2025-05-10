"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Moon } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // For development/testing - use test account if in debug mode
      const emailToUse = debugMode ? "test@example.com" : email
      const passwordToUse = debugMode ? "password123" : password

      console.log("Attempting login with:", { email: emailToUse, debugMode })

      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: passwordToUse,
      })

      if (signInError) {
        console.error("Login error details:", JSON.stringify(signInError))

        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          setShowVerificationMessage(true)
        } else {
          // Handle all other error cases with a user-friendly message
          setError("Invalid email or password. Please try again.")
        }
      } else if (data.user) {
        // Successful login
        console.log("Login successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      console.error("Login exception:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message || "Failed to resend verification email")
      } else {
        // Reset error if successful
        setError(null)
      }
    } catch (err: any) {
      console.error("Resend verification error:", err)
      setError(err.message || "Failed to resend verification email")
    } finally {
      setIsLoading(false)
    }
  }

  // For development only - create a test user
  const createTestUser = async () => {
    if (process.env.NODE_ENV !== "development") return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      if (error) {
        console.error("Test user creation error:", error)
        setError("Could not create test user: " + error.message)
      } else {
        setError(null)
        alert("Test user created or already exists. You can now use debug mode to log in.")
      }
    } catch (err) {
      console.error("Test user creation exception:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (showVerificationMessage) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to <strong>{email}</strong>. Please check your email (including spam folder)
            to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            If you don't see the email within a few minutes, please check your spam folder or click below to resend.
          </p>
          <Button onClick={handleResendVerification} variant="outline" disabled={isLoading} className="mb-4">
            {isLoading ? "Sending..." : "Resend verification email"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="link" className="text-rose-500">
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <Moon className="h-10 w-10 text-rose-500" />
          <span className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent ml-2">
            Lumos
          </span>
        </div>
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">Enter your credentials to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!debugMode}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-rose-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!debugMode}
            />
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="debug-mode"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <Label htmlFor="debug-mode" className="text-sm font-normal">
                Debug mode (use test account)
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={createTestUser} className="ml-auto text-xs">
                Create Test User
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-rose-500 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
