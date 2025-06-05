"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

type ConversationWithParticipant = {
  id: string
  created_at: string
  participant: Profile
  last_message?: {
    content: string
    created_at: string
    is_read: boolean
    sender_id: string
  }
}

export function ConversationList() {
  const { user } = useAuth()
  const pathname = usePathname()
  const supabase = createClient()

  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      setLoading(true)

      try {
        // Get all conversations the user is part of
        const { data: participations, error: participationsError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("profile_id", user.id)

        if (participationsError) throw participationsError

        if (!participations.length) {
          setConversations([])
          return
        }

        const conversationIds = participations.map((p) => p.conversation_id)

        // For each conversation, get the other participant
        const conversationsWithParticipants: ConversationWithParticipant[] = []

        for (const conversationId of conversationIds) {
          // Get the conversation
          const { data: conversation, error: conversationError } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", conversationId)
            .single()

          if (conversationError) continue

          // Get the other participant
          const { data: participants, error: participantsError } = await supabase
            .from("conversation_participants")
            .select("profile_id")
            .eq("conversation_id", conversationId)
            .neq("profile_id", user.id)

          if (participantsError || !participants.length) continue

          const otherParticipantId = participants[0].profile_id

          // Get the other participant's profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherParticipantId)
            .single()

          if (profileError) continue

          // Get the last message
          const { data: messages, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)

          const lastMessage = messagesError ? undefined : messages[0]

          conversationsWithParticipants.push({
            id: conversation.id,
            created_at: conversation.created_at,
            participant: profile,
            last_message: lastMessage
              ? {
                  content: lastMessage.content,
                  created_at: lastMessage.created_at,
                  is_read: lastMessage.is_read,
                  sender_id: lastMessage.profile_id,
                }
              : undefined,
          })
        }

        // Sort by last message time or conversation creation time
        conversationsWithParticipants.sort((a, b) => {
          const aTime = a.last_message?.created_at || a.created_at
          const bTime = b.last_message?.created_at || b.created_at
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })

        setConversations(conversationsWithParticipants)
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [user, supabase])

  const filteredConversations = conversations.filter((conversation) => {
    const participantName = conversation.participant.full_name || conversation.participant.username || ""
    return participantName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search conversations"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            {searchQuery ? "No conversations match your search" : "No conversations yet"}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredConversations.map((conversation) => {
              const isActive = pathname === `/messages/${conversation.id}`
              const hasUnread =
                conversation.last_message &&
                !conversation.last_message.is_read &&
                conversation.last_message.sender_id !== user?.id

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
                          {conversation.last_message && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(conversation.last_message.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {conversation.last_message ? (
                              conversation.last_message.sender_id === user?.id ? (
                                <span>You: {conversation.last_message.content}</span>
                              ) : (
                                conversation.last_message.content
                              )
                            ) : (
                              <span className="italic">No messages yet</span>
                            )}
                          </p>
                          {hasUnread && <span className="inline-block h-2 w-2 rounded-full bg-rose-500"></span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Conversation
        </Button>
      </div>
    </div>
  )
}
