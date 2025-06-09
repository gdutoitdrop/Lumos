"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SimpleMessageThread } from "@/components/messaging/simple-message-thread"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()

  const [participantInfo, setParticipantInfo] = useState({
    name: "Unknown User",
    username: "unknown",
    avatar_url: undefined,
  })
  const [matchId, setMatchId] = useState("22222222-2222-2222-2222-222222222222")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchParticipantInfo = async () => {
      if (!user || !conversationId) {
        setLoading(false)
        return
      }

      try {
        // Get conversation participants
        const { data: conversation } = await supabase
          .from("user_conversations")
          .select("participant_1, participant_2")
          .eq("id", conversationId)
          .single()

        if (conversation) {
          const otherUserId =
            conversation.participant_1 === user.id ? conversation.participant_2 : conversation.participant_1

          setMatchId(otherUserId)

          // Get participant profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, username, avatar_url")
            .eq("id", otherUserId)
            .single()

          if (profile) {
            setParticipantInfo({
              name: profile.full_name || profile.username || "Unknown User",
              username: profile.username || "unknown",
              avatar_url: profile.avatar_url,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching participant info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchParticipantInfo()
  }, [user, conversationId, supabase])

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

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)]">
        <SimpleMessageThread conversationId={conversationId} matchId={matchId} />
      </div>
    </DashboardLayout>
  )
}
