"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { systemHealthChecker, type HealthCheckResult } from "@/lib/system-health"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  MessageSquare,
  Heart,
  Users,
  Play,
  Bug,
} from "lucide-react"

export default function SystemHealthPage() {
  const { user } = useAuth()
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([])
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const results = await systemHealthChecker.runFullHealthCheck(user?.id)
      setHealthResults(results)
      setLastCheck(new Date())
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const runSpecificTest = async (feature: string) => {
    setLoading(true)
    try {
      const result = await systemHealthChecker.testSpecificFeature(feature, user?.id)
      setHealthResults((prev) => {
        const filtered = prev.filter((r) => r.component !== result.component)
        return [...filtered, result]
      })
    } catch (error) {
      console.error(`Test for ${feature} failed:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getOverallStatus = () => {
    if (healthResults.length === 0) return "unknown"

    const hasErrors = healthResults.some((r) => r.status === "error")
    const hasWarnings = healthResults.some((r) => r.status === "warning")

    if (hasErrors) return "error"
    if (hasWarnings) return "warning"
    return "healthy"
  }

  const healthyCount = healthResults.filter((r) => r.status === "healthy").length
  const warningCount = healthResults.filter((r) => r.status === "warning").length
  const errorCount = healthResults.filter((r) => r.status === "error").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-2">
                    <Bug className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">System Health Dashboard</CardTitle>
                    <p className="text-slate-600">Monitor and test all platform components</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(getOverallStatus())}
                  {getStatusBadge(getOverallStatus())}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
                <div className="text-sm text-slate-600">Healthy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-slate-600">Warnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-slate-600">Errors</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-slate-600">{healthResults.length}</div>
                <div className="text-sm text-slate-600">Total Checks</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={runHealthCheck}
                    disabled={loading}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Running Tests..." : "Run Full Health Check"}
                  </Button>
                  {lastCheck && (
                    <span className="text-sm text-slate-500">Last check: {lastCheck.toLocaleTimeString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => runSpecificTest("database")}>
                    <Database className="h-4 w-4 mr-1" />
                    Test DB
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => runSpecificTest("messaging")}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Test Messaging
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => runSpecificTest("matching")}>
                    <Heart className="h-4 w-4 mr-1" />
                    Test Matching
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Results</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {healthResults.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Play className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No health checks run yet</h3>
                    <p className="text-slate-500 mb-4">Click "Run Full Health Check" to test all system components</p>
                    <Button onClick={runHealthCheck} disabled={loading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Health Check
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthResults.map((result, index) => (
                    <Card
                      key={index}
                      className={`border-l-4 ${
                        result.status === "healthy"
                          ? "border-l-green-500"
                          : result.status === "warning"
                            ? "border-l-yellow-500"
                            : "border-l-red-500"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{result.component}</h3>
                          {getStatusIcon(result.status)}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{result.message}</p>
                        {getStatusBadge(result.status)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {healthResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.component}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{result.message}</p>
                    {result.details && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Technical Details:</h4>
                        <pre className="text-xs text-slate-600 dark:text-slate-300 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => runSpecificTest("database")}
                    >
                      Test Database Connection
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => runSpecificTest("profiles")}
                    >
                      Test Profiles Table
                    </Button>
                    <Alert>
                      <AlertDescription className="text-sm">
                        Run the complete-system-verification.sql script in your Supabase dashboard to ensure all tables
                        exist.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messaging Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => runSpecificTest("messaging")}
                    >
                      Test Messaging System
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => (window.location.href = "/messages")}
                    >
                      Open Messages
                    </Button>
                    <Alert>
                      <AlertDescription className="text-sm">
                        Messaging system includes demo data for testing when database is empty.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Matching Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => runSpecificTest("matching")}
                    >
                      Test Matching System
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => (window.location.href = "/matching")}
                    >
                      Open Matching
                    </Button>
                    <Alert>
                      <AlertDescription className="text-sm">
                        Matching system provides demo matches when no real matches exist.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Community Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => runSpecificTest("forum")}
                    >
                      Test Forum System
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => (window.location.href = "/community")}
                    >
                      Open Community
                    </Button>
                    <Alert>
                      <AlertDescription className="text-sm">
                        Forum system includes sample threads and categories for testing.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
