"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EnhancedMessageThread } from "@/components/messaging/enhanced-message-thread"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function MatchConversationPage() {
  const { user } = useAuth()
  const params = useParams()
  const matchId = params.id as string

  const [participant, setParticipant] = useState<any>(null)
  const [conversationId, setConversationId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !matchId) return

    const initializeConversation = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, get the participant's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, bio")
          .eq("id", matchId)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setError("Could not find user profile")
          return
        }

        if (!profile) {
          setError("User not found")
          return
        }

        setParticipant({
          id: profile.id,
          name: profile.full_name || profile.username || "Unknown User",
          username: profile.username || "unknown",
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        })

        // Try to find existing conversation or create a demo one
        try {
          const { data: existingConversation } = await supabase
            .from("user_conversations")
            .select("id")
            .or(`and(user1_id.eq.${user.id},user2_id.eq.${matchId}),and(user1_id.eq.${matchId},user2_id.eq.${user.id})`)
            .single()

          if (existingConversation) {
            setConversationId(existingConversation.id)
          } else {
            // Create a demo conversation ID for now
            setConversationId(`demo-${user.id}-${matchId}`)
          }
        } catch (convError) {
          console.error("Conversation error (using demo mode):", convError)
          setConversationId(`demo-${user.id}-${matchId}`)
        }
      } catch (error) {
        console.error("Error initializing conversation:", error)
        setError("Failed to load conversation")
      } finally {
        setLoading(false)
      }
    }

    initializeConversation()
  }, [user, matchId])

  if (!user) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please log in to view messages.</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading conversation...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/messages")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Messages
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!participant) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>User not found.</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-screen">
        <EnhancedMessageThread
          conversationId={conversationId}
          matchId={matchId}
          participantInfo={{
            name: participant.name,
            username: participant.username,
            avatar_url: participant.avatar_url,
          }}
        />
      </div>
    </DashboardLayout>
  )
}
