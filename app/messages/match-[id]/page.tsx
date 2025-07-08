"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { EnhancedMessageThread } from "@/components/messaging/enhanced-message-thread"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"

interface MatchConversationPageProps {
  params: {
    id: string
  }
}

export default function MatchConversationPage({ params }: MatchConversationPageProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const matchId = params.id

  // Extract actual match ID (remove "match-" prefix if present)
  const actualMatchId = matchId.startsWith("match-") ? matchId.replace("match-", "") : matchId

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [participantInfo, setParticipantInfo] = useState<{
    name: string
    username: string
    avatar_url?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeConversation = async () => {
      if (!user || !actualMatchId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // First, try to get participant info
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", actualMatchId)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          // Use fallback participant info
          setParticipantInfo({
            name: "User",
            username: "user",
            avatar_url: undefined,
          })
        } else if (profile) {
          setParticipantInfo({
            name: profile.full_name || profile.username || "User",
            username: profile.username || "user",
            avatar_url: profile.avatar_url || undefined,
          })
        }

        // Try to find existing conversation
        const { data: existingConversation, error: convError } = await supabase
          .from("conversation_participants")
          .select(`
            conversation_id,
            conversations (
              id,
              created_at,
              updated_at
            )
          `)
          .eq("user_id", user.id)

        if (convError) {
          console.error("Error finding conversation:", convError)
          // Create a demo conversation ID
          setConversationId(`demo-${user.id}-${actualMatchId}`)
        } else if (existingConversation && existingConversation.length > 0) {
          // Find conversation that includes both users
          let foundConversation = false
          for (const conv of existingConversation) {
            const { data: otherParticipants } = await supabase
              .from("conversation_participants")
              .select("user_id")
              .eq("conversation_id", conv.conversation_id)
              .neq("user_id", user.id)

            if (otherParticipants?.some((p) => p.user_id === actualMatchId)) {
              setConversationId(conv.conversation_id)
              foundConversation = true
              break
            }
          }

          // If no existing conversation found, create demo one
          if (!foundConversation) {
            setConversationId(`demo-${user.id}-${actualMatchId}`)
          }
        } else {
          // No conversations found, create demo one
          setConversationId(`demo-${user.id}-${actualMatchId}`)
        }
      } catch (error) {
        console.error("Error initializing conversation:", error)
        setError("Failed to load conversation")
        // Use demo conversation as fallback
        setConversationId(`demo-${user.id}-${actualMatchId}`)
        setParticipantInfo({
          name: "User",
          username: "user",
          avatar_url: undefined,
        })
      } finally {
        setLoading(false)
      }
    }

    initializeConversation()
  }, [user, actualMatchId, supabase])

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to access messages.</p>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Loading conversation...</h3>
          <p className="text-slate-500">Setting up your chat</p>
        </div>
      </div>
    )
  }

  if (error && !conversationId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Conversation Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => (window.location.href = "/messages")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Messages
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <EnhancedMessageThread
        conversationId={conversationId || `demo-${user.id}-${actualMatchId}`}
        matchId={actualMatchId}
        participantInfo={participantInfo || undefined}
      />
    </div>
  )
}
