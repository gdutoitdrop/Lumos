"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth/auth-provider"
import { getConversations } from "@/actions/messaging"
import { realtimeManager } from "@/lib/supabase/realtime"
import { createClient } from "@/lib/supabase/client"

type Conversation = Awaited<ReturnType<typeof getConversations>>[0]

export function ConversationList() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      try {
        const data = await getConversations()
        setConversations(data)
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // Subscribe to new conversations
    if (user) {
      const unsubscribe = realtimeManager.subscribeToConversations(user.id, async (payload) => {
        // Refresh the conversations list
        const data = await getConversations()
        setConversations(data)
      })

      return () => {
        unsubscribe()
      }
    }
  }, [user])

  // Format the timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      // Yesterday
      return "Yesterday"
    } else if (diffInDays < 7) {
      // This week, show day name
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      // Older, show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (loading) {
    return (
      <div className="h-full p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {conversations.map((conversation) => {
              const isActive = pathname === `/messages/${conversation.id}`
              const participant = conversation.otherParticipant
              const latestMessage = conversation.latestMessage
              const hasUnread = conversation.unreadCount > 0

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`block p-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    isActive ? "bg-slate-100 dark:bg-slate-800" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant?.avatar_url || ""} alt={participant?.username || ""} />
                      <AvatarFallback>{participant?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{participant?.full_name || participant?.username}</h3>
                        {latestMessage && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(latestMessage.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-sm truncate ${
                            hasUnread
                              ? "text-slate-900 dark:text-slate-100 font-medium"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {latestMessage?.content || "No messages yet"}
                        </p>
                        {hasUnread && (
                          <span className="ml-2 flex-shrink-0 h-5 w-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
