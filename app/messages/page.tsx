"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { messagingService, type Conversation } from "@/lib/simple-messaging"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Plus, Users } from "lucide-react"

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const userConversations = await messagingService.getUserConversations(user.id)
        setConversations(userConversations)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setError("Failed to load conversations")
        // Set demo conversations as fallback
        setConversations([
          {
            id: "demo-conv-1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            other_user: {
              id: "demo-user-1",
              name: "Sarah Johnson",
              username: "sarah_j",
              avatar_url: undefined,
            },
            last_message: {
              id: "demo-msg-1",
              conversation_id: "demo-conv-1",
              sender_id: "demo-user-1",
              content: "Hey! How are you doing today?",
              message_type: "text",
              created_at: new Date().toISOString(),
              is_read: false,
            },
            unread_count: 1,
          },
          {
            id: "demo-conv-2",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            other_user: {
              id: "demo-user-2",
              name: "Mike Chen",
              username: "mike_c",
              avatar_url: undefined,
            },
            last_message: {
              id: "demo-msg-2",
              conversation_id: "demo-conv-2",
              sender_id: user.id,
              content: "Thanks for the great conversation!",
              message_type: "text",
              created_at: new Date().toISOString(),
              is_read: true,
            },
            unread_count: 0,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user?.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const handleConversationClick = (conversation: Conversation) => {
    if (conversation.other_user) {
      window.location.href = `/messages/match-${conversation.other_user.id}`
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="bg-rose-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to access your messages.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Messages</h1>
                <p className="text-slate-600">Stay connected with your matches</p>
              </div>
              <Button
                onClick={() => (window.location.href = "/messages/new")}
                className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading conversations...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredConversations.length === 0 ? (
            /* Empty State */
            <Card>
              <CardContent className="p-12 text-center">
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  {searchQuery ? "No conversations found" : "No messages yet"}
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start connecting with people to begin conversations"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/matching")}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Find Matches
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/messages/new")}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Conversations List */
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-slate-200 hover:border-rose-300"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        {conversation.other_user?.avatar_url ? (
                          <AvatarImage
                            src={conversation.other_user.avatar_url || "/placeholder.svg"}
                            alt={conversation.other_user.name}
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            {conversation.other_user?.name.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-slate-800 truncate">
                            {conversation.other_user?.name || "Unknown User"}
                          </h3>
                          <div className="flex items-center gap-2">
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {conversation.last_message
                                ? formatMessageTime(conversation.last_message.created_at)
                                : formatMessageTime(conversation.created_at)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-1">@{conversation.other_user?.username || "unknown"}</p>

                        {conversation.last_message && (
                          <p className="text-sm text-slate-600 truncate">
                            {conversation.last_message.sender_id === user.id ? "You: " : ""}
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
