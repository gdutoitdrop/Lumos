"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} reset={this.handleReset} />
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred. This has been logged and we're working to fix it.
                </AlertDescription>
              </Alert>

              {this.state.error && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Error Details:</h4>
                  <p className="text-sm text-red-600 font-mono">{this.state.error.message}</p>
                  {process.env.NODE_ENV === "development" && this.state.error.stack && (
                    <pre className="text-xs text-slate-600 mt-2 overflow-x-auto">{this.state.error.stack}</pre>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/system-health")}
                  className="flex items-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  System Health
                </Button>
              </div>

              <div className="text-sm text-slate-500">
                <p>If this problem persists, please:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check the System Health dashboard</li>
                  <li>Refresh the page</li>
                  <li>Clear your browser cache</li>
                  <li>Contact support if the issue continues</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
