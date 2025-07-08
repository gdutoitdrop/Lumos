"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Conversation {
  id: string
  created_at: string
  updated_at: string
  other_user: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count: number
}

export default function MessagesPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Try to fetch real conversations
        const { data: participantData, error: participantError } = await supabase
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

        if (participantError) {
          console.error("Error fetching conversations:", participantError)
          // Use demo conversations
          setConversations([
            {
              id: "demo-1",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              other_user: {
                id: "demo-user-1",
                name: "Sarah Johnson",
                username: "sarah_j",
                avatar_url: undefined,
              },
              last_message: {
                content: "Hey! How are you doing today?",
                created_at: new Date().toISOString(),
                sender_id: "demo-user-1",
              },
              unread_count: 2,
            },
            {
              id: "demo-2",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              other_user: {
                id: "demo-user-2",
                name: "Mike Chen",
                username: "mike_c",
                avatar_url: undefined,
              },
              last_message: {
                content: "Thanks for the great conversation!",
                created_at: new Date().toISOString(),
                sender_id: user.id,
              },
              unread_count: 0,
            },
          ])
          setLoading(false)
          return
        }

        if (!participantData || participantData.length === 0) {
          setConversations([])
          setLoading(false)
          return
        }

        // Fetch other participants and messages for each conversation
        const conversationsWithDetails = await Promise.all(
          participantData.map(async (participant) => {
            const conversationId = participant.conversation_id

            // Get other participants
            const { data: otherParticipants } = await supabase
              .from("conversation_participants")
              .select(`
                user_id,
                profiles (
                  id,
                  username,
                  full_name,
                  avatar_url
                )
              `)
              .eq("conversation_id", conversationId)
              .neq("user_id", user.id)

            // Get last message
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("content, message_text, created_at, sender_id")
              .eq("conversation_id", conversationId)
              .order("created_at", { ascending: false })
              .limit(1)

            // Get unread count
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conversationId)
              .eq("is_read", false)
              .neq("sender_id", user.id)

            const otherUser = otherParticipants?.[0]
            const profile = otherUser?.profiles

            return {
              id: conversationId,
              created_at: participant.conversations?.created_at || new Date().toISOString(),
              updated_at: participant.conversations?.updated_at || new Date().toISOString(),
              other_user: {
                id: otherUser?.user_id || "unknown",
                name: profile?.full_name || profile?.username || "Unknown User",
                username: profile?.username || "unknown",
                avatar_url: profile?.avatar_url || undefined,
              },
              last_message: lastMessage?.[0]
                ? {
                    content: lastMessage[0].content || lastMessage[0].message_text || "",
                    created_at: lastMessage[0].created_at,
                    sender_id: lastMessage[0].sender_id,
                  }
                : undefined,
              unread_count: unreadCount || 0,
            }
          }),
        )

        setConversations(conversationsWithDetails)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user, supabase])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to access your messages.</p>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Messages</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Connect with your matches and start meaningful conversations
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => (window.location.href = "/messages/new")}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Your Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No conversations yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Start connecting with people and your conversations will appear here.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/matching")}
                    variant="outline"
                    className="bg-transparent"
                  >
                    Find Matches
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => (window.location.href = `/messages/match-${conversation.other_user.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        {conversation.other_user.avatar_url ? (
                          <AvatarImage
                            src={conversation.other_user.avatar_url || "/placeholder.svg"}
                            alt={conversation.other_user.name}
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            {conversation.other_user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-800 dark:text-white truncate">
                            {conversation.other_user.name}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge variant="secondary" className="bg-rose-500 text-white">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {conversation.last_message ? (
                            <>
                              {conversation.last_message.sender_id === user.id ? "You: " : ""}
                              {conversation.last_message.content}
                            </>
                          ) : (
                            "No messages yet"
                          )}
                        </p>
                      </div>

                      <div className="text-xs text-slate-400">
                        {conversation.last_message
                          ? formatMessageTime(conversation.last_message.created_at)
                          : formatMessageTime(conversation.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
