"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { EnhancedMessageThread } from "@/components/messaging/enhanced-message-thread"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MatchConversationPage() {
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [matchId, setMatchId] = useState<string>("")
  const [conversationId, setConversationId] = useState<string>("")

  useEffect(() => {
    // Safely extract match ID from params
    const rawMatchId = params?.id

    if (rawMatchId && typeof rawMatchId === "string") {
      setMatchId(rawMatchId)

      // Create a conversation ID - if it's already a UUID, use it directly
      // Otherwise, create a demo conversation ID
      const cleanId = rawMatchId.startsWith("match-") ? rawMatchId.replace("match-", "") : rawMatchId

      // Check if it looks like a UUID (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      if (uuidRegex.test(cleanId)) {
        // It's a valid UUID, use it as conversation ID
        setConversationId(cleanId)
      } else {
        // It's not a UUID, create a demo conversation ID
        setConversationId(`demo-conv-${cleanId}`)
      }
    } else {
      // Fallback for invalid params
      setMatchId("demo-user-1")
      setConversationId("demo-conv-1")
    }

    setLoading(false)
  }, [params])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to access messages.</p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Loading conversation...</h3>
          <p className="text-slate-500">Setting up your chat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <EnhancedMessageThread
        conversationId={conversationId}
        matchId={matchId}
        participantInfo={{
          name: "Demo User",
          username: "demo_user",
          avatar_url: "/placeholder.svg?height=40&width=40",
        }}
      />
    </div>
  )
}
