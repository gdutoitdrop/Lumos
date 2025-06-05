"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, MessageCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function ConversationList() {
  const { user } = useAuth()
  const pathname = usePathname()

  const [conversations, setConversations] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMatches, setShowMatches] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch matches first (simpler query)
        const { data: matches1 } = await supabase
          .from("matches")
          .select(`
            id,
            match_score,
            matched_profile:profiles!matches_profile_id_2_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("profile_id_1", user.id)
          .eq("status", "accepted")

        const { data: matches2 } = await supabase
          .from("matches")
          .select(`
            id,
            match_score,
            matched_profile:profiles!matches_profile_id_1_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("profile_id_2", user.id)
          .eq("status", "accepted")

        const allMatches = [...(matches1 || []), ...(matches2 || [])]

        setMatches(allMatches)

        // Try to fetch conversations (might fail if tables don't exist)
        try {
          const { data: participations } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("profile_id", user.id)

          if (participations && participations.length > 0) {
            const conversationIds = participations.map((p) => p.conversation_id)

            const conversationsWithParticipants = []

            for (const conversationId of conversationIds) {
              // Get other participant
              const { data: otherParticipants } = await supabase
                .from("conversation_participants")
                .select("profile_id")
                .eq("conversation_id", conversationId)
                .neq("profile_id", user.id)

              if (otherParticipants && otherParticipants.length > 0) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", otherParticipants[0].profile_id)
                  .single()

                if (profile) {
                  // Get last message
                  const { data: lastMessage } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", conversationId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single()

                  conversationsWithParticipants.push({
                    id: conversationId,
                    participant: profile,
                    lastMessage: lastMessage || null,
                  })
                }
              }
            }

            setConversations(conversationsWithParticipants)
          } else {
            setConversations([])
          }
        } catch (error) {
          console.log("Conversations not available yet:", error)
          setConversations([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setMatches([])
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const startConversation = async (matchedProfileId: string) => {
    if (!user || creating) return

    try {
      setCreating(true)

      // Simple approach: create conversation and navigate
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (conversationError) {
        console.error("Error creating conversation:", conversationError)
        alert("Unable to start conversation. Please try again.")
        return
      }

      // Add participants one by one to avoid policy issues
      const { error: participant1Error } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, profile_id: user.id })

      if (participant1Error) {
        console.error("Error adding user to conversation:", participant1Error)
        alert("Unable to start conversation. Please try again.")
        return
      }

      const { error: participant2Error } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, profile_id: matchedProfileId })

      if (participant2Error) {
        console.error("Error adding match to conversation:", participant2Error)
        alert("Unable to start conversation. Please try again.")
        return
      }

      // Navigate to conversation
      window.location.href = `/messages/${conversation.id}`
    } catch (error) {
      console.error("Error in startConversation:", error)
      alert("Unable to start conversation. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    const participantName = conversation.participant.full_name || conversation.participant.username || ""
    return participantName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredMatches = matches.filter((match) => {
    const matchName = match.matched_profile?.full_name || match.matched_profile?.username || ""
    return matchName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search conversations or matches"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={!showMatches ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMatches(false)}
            className="flex-1"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Conversations ({conversations.length})
          </Button>
          <Button
            variant={showMatches ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMatches(true)}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Matches ({matches.length})
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!showMatches ? (
          // Show conversations
          filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              <div className="mb-4">
                <MessageCircle className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className="text-sm">Start messaging your matches to begin conversations</p>
              </div>
              <Button onClick={() => setShowMatches(true)} variant="outline">
                View Your Matches
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredConversations.map((conversation) => {
                const isActive = pathname === `/messages/${conversation.id}`

                return (
                  <li key={conversation.id}>
                    <Link
                      href={`/messages/${conversation.id}`}
                      className={`block p-4 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        isActive ? "bg-rose-50 dark:bg-rose-900/20" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={conversation.participant.avatar_url || ""}
                            alt={conversation.participant.username || ""}
                          />
                          <AvatarFallback>{conversation.participant.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {conversation.participant.full_name || conversation.participant.username}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {conversation.lastMessage ? (
                              conversation.lastMessage.profile_id === user?.id ? (
                                <span>You: {conversation.lastMessage.content}</span>
                              ) : (
                                conversation.lastMessage.content
                              )
                            ) : (
                              <span className="italic">Start the conversation</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )
        ) : // Show matches
        filteredMatches.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            <div className="mb-4">
              <Plus className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No matches yet</h3>
              <p className="text-sm">Visit the matching page to find people to connect with</p>
            </div>
            <Button onClick={() => (window.location.href = "/matching")} variant="outline">
              Find Matches
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredMatches.map((match) => (
              <li key={match.id}>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={match.matched_profile?.avatar_url || ""}
                        alt={match.matched_profile?.username || ""}
                      />
                      <AvatarFallback>{match.matched_profile?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {match.matched_profile?.full_name || match.matched_profile?.username}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {Math.round((match.match_score || 0) * 100)}% Match
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startConversation(match.matched_profile.id)}
                      disabled={creating}
                      className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                    >
                      {creating ? "Starting..." : "Message"}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
