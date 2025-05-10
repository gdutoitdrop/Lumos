"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function SeedUsersPage() {
  const [adminKey, setAdminKey] = useState("")
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    users?: string[]
    error?: string
  }>({})

  const handleSeedUsers = async () => {
    setLoading(true)
    setResult({})

    try {
      const response = await fetch(`/api/seed/users?adminKey=${adminKey}&count=${count}`)
      const data = await response.json()

      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || "Failed to create test users",
        })
        return
      }

      setResult({
        success: true,
        message: data.message,
        users: data.users,
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Test Users</CardTitle>
          <CardDescription>
            Generate test user profiles to populate the platform for testing search and matching functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="adminKey" className="text-sm font-medium">
              Admin Key
            </label>
            <Input
              id="adminKey"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter your admin key"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="count" className="text-sm font-medium">
              Number of Users
            </label>
            <Input
              id="count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number.parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Maximum 50 users per request</p>
          </div>

          {result.success && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.users && result.users.length > 0 && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">View created users</summary>
                      <ul className="mt-2 text-sm space-y-1 max-h-40 overflow-y-auto">
                        {result.users.map((user, index) => (
                          <li key={index}>{user}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeedUsers} disabled={loading || !adminKey || count < 1} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Users...
              </>
            ) : (
              "Create Test Users"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-sm text-muted-foreground">
        <h3 className="font-medium text-foreground mb-2">How to use:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Enter your admin key (the same one set in your environment variables as ADMIN_SEED_KEY)</li>
          <li>Choose how many test users you want to create (1-50)</li>
          <li>Click "Create Test Users" to generate diverse user profiles</li>
          <li>Once created, you can log in as any of these users with the password "password123"</li>
          <li>These users will have random mental health badges, interests, and other profile details</li>
        </ol>
      </div>
    </div>
  )
}
