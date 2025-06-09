"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface HealthCheck {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: string
}

export function SystemHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const runHealthChecks = async () => {
    setLoading(true)
    const newChecks: HealthCheck[] = []

    // Check 1: Authentication
    try {
      if (user) {
        newChecks.push({
          name: "Authentication",
          status: "success",
          message: "User authenticated successfully",
          details: `User ID: ${user.id}`,
        })
      } else {
        newChecks.push({
          name: "Authentication",
          status: "warning",
          message: "No user authenticated",
        })
      }
    } catch (error) {
      newChecks.push({
        name: "Authentication",
        status: "error",
        message: "Authentication check failed",
        details: String(error),
      })
    }

    // Check 2: Database Connection
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      if (error) throw error
      newChecks.push({
        name: "Database Connection",
        status: "success",
        message: "Database connection successful",
      })
    } catch (error: any) {
      newChecks.push({
        name: "Database Connection",
        status: "error",
        message: "Database connection failed",
        details: error.message,
      })
    }

    // Check 3: Messaging Tables
    try {
      const { data: conversations, error: convError } = await supabase
        .from("user_conversations")
        .select("count")
        .limit(1)

      const { data: messages, error: msgError } = await supabase.from("user_messages").select("count").limit(1)

      if (convError || msgError) throw convError || msgError

      newChecks.push({
        name: "Messaging System",
        status: "success",
        message: "Messaging tables accessible",
      })
    } catch (error: any) {
      newChecks.push({
        name: "Messaging System",
        status: "error",
        message: "Messaging system check failed",
        details: error.message,
      })
    }

    // Check 4: Forum System
    try {
      const { data, error } = await supabase.from("forum_threads").select("count").limit(1)
      if (error) throw error
      newChecks.push({
        name: "Forum System",
        status: "success",
        message: "Forum system accessible",
      })
    } catch (error: any) {
      newChecks.push({
        name: "Forum System",
        status: "error",
        message: "Forum system check failed",
        details: error.message,
      })
    }

    // Check 5: Matching System
    try {
      const { data, error } = await supabase.from("matches").select("count").limit(1)
      if (error) throw error
      newChecks.push({
        name: "Matching System",
        status: "success",
        message: "Matching system accessible",
      })
    } catch (error: any) {
      newChecks.push({
        name: "Matching System",
        status: "error",
        message: "Matching system check failed",
        details: error.message,
      })
    }

    setChecks(newChecks)
    setLoading(false)
  }

  useEffect(() => {
    runHealthChecks()
  }, [user])

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "loading":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: HealthCheck["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
      case "loading":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
    }
  }

  const overallStatus = checks.some((c) => c.status === "error")
    ? "error"
    : checks.some((c) => c.status === "warning")
      ? "warning"
      : "success"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(loading ? "loading" : overallStatus)}
            System Health Check
          </CardTitle>
          <Button variant="outline" size="sm" onClick={runHealthChecks} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <Alert key={index} className={getStatusColor(check.status)}>
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{check.name}</h4>
                  </div>
                  <p className="text-sm mt-1">{check.message}</p>
                  {check.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground">Details</summary>
                      <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">{check.details}</pre>
                    </details>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>

        {overallStatus === "success" && (
          <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>All systems are operational! The platform is ready to use.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
