"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]

interface Conversation {
  id: string
  otherParticipant: Pick<Profile, "id" | "full_name" | "avatar_url"> | null
  lastMessage: Message | null
  created_at: string
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function loadConversations() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get all conversations where the user is a participant
      const { data: participations, error: participationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id)

      if (participationsError || !participations.length) {
        setLoading(false)
        return
      }

      const conversationIds = participations.map((p) => p.conversation_id)

      // For each conversation, get the other participant and the latest message
      const conversationsWithData = await Promise.all(
        conversationIds.map(async (conversationId) => {
          // Get the other participant
          const { data: otherParticipant } = await supabase
            .from("conversation_participants")
            .select("profile_id")
            .eq("conversation_id", conversationId)
            .neq("profile_id", user.id)
            .single()

          if (!otherParticipant) return null

          // Get the other participant's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", otherParticipant.profile_id)
            .single()

          // Get the latest message
          const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)

          // Get the conversation
          const { data: conversation } = await supabase
            .from("conversations")
            .select("created_at")
            .eq("id", conversationId)
            .single()

          return {
            id: conversationId,
            otherParticipant: profile,
            lastMessage: messages && messages.length > 0 ? messages[0] : null,
            created_at: conversation?.created_at || new Date().toISOString(),
          }
        }),
      )

      // Filter out null values and sort by latest message or creation date
      const validConversations = conversationsWithData
        .filter((c): c is Conversation => c !== null)
        .sort((a, b) => {
          const dateA = a.lastMessage?.created_at || a.created_at
          const dateB = b.lastMessage?.created_at || b.created_at
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

      setConversations(validConversations)
      setLoading(false)
    }

    loadConversations()

    // Subscribe to new messages to update the conversation list
    const channel = supabase
      .channel("new_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted mr-3"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-muted rounded"></div>
              <div className="h-3 w-1/2 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-4">No conversations yet</p>
        <Button asChild>
          <Link href="/matching">
            <PlusCircle className="mr-2 h-4 w-4" />
            Find matches
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/messages/${conversation.id}`}
          className={`flex items-center p-3 rounded-lg hover:bg-muted transition-colors ${
            pathname === `/messages/${conversation.id}` ? "bg-muted" : ""
          }`}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage
              src={conversation.otherParticipant?.avatar_url || undefined}
              alt={conversation.otherParticipant?.full_name || "User"}
            />
            <AvatarFallback>{conversation.otherParticipant?.full_name?.substring(0, 2) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate">{conversation.otherParticipant?.full_name || "Unknown User"}</h3>
              {conversation.lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage ? conversation.lastMessage.content : "Start a conversation"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
