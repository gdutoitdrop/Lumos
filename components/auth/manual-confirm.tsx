"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

export function ManualConfirm() {
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<{ success?: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleManualConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // First, try to get the user by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single()

      if (userError) {
        setResult({
          success: false,
          message: `User not found with email: ${email}. Note: This tool only works for development purposes and requires admin privileges.`,
        })
        return
      }

      // This is a workaround for development - in production, you would never do this
      // This simulates confirming a user by updating their profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ email_confirmed_at: new Date().toISOString() })
        .eq("id", userData.id)

      if (updateError) {
        throw updateError
      }

      setResult({
        success: true,
        message: `User with email ${email} has been manually confirmed for development purposes.`,
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
      <CardHeader>
        <CardTitle className="text-red-800 dark:text-red-300">⚠️ Development Tool Only</CardTitle>
        <CardDescription>
          This tool is for development purposes only. It simulates confirming a user's email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert
            className={
              result.success
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 mb-4"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 mb-4"
            }
          >
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleManualConfirm} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-email">User Email</Label>
            <Input
              id="confirm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? "Processing..." : "Manually Confirm User (Dev Only)"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-red-600 dark:text-red-400">
          Warning: This is not a secure approach and should never be used in production. It's only for testing during
          development.
        </p>
      </CardContent>
    </Card>
  )
}
