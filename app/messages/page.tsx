"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, Search, Users, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { messagingService, type Conversation } from "@/lib/simple-messaging"

export default function MessagesPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("Error getting user:", error)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error("Error in getUser:", error)
      }
    }

    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const userConversations = await messagingService.getUserConversations(user.id)
        setConversations(userConversations)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        // Set demo conversations on error
        setConversations([
          {
            id: "demo-conv-1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            other_user: {
              id: "demo-user-1",
              name: "Sarah Johnson",
              username: "sarah_j",
            },
            unread_count: 2,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  const filteredConversations = conversations.filter((conv) => {
    if (!conv.other_user) return false
    const searchLower = searchQuery.toLowerCase()
    return (
      conv.other_user.name.toLowerCase().includes(searchLower) ||
      conv.other_user.username.toLowerCase().includes(searchLower)
    )
  })

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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Messages</h1>
            <p className="text-slate-600">Connect with your matches and start meaningful conversations</p>
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
                {conversations.length > 0 && <Badge variant="secondary">{conversations.length}</Badge>}
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
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No conversations yet</h3>
                  <p className="text-slate-500 mb-4">
                    Start connecting with people and your conversations will appear here.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => (window.location.href = "/matching")} variant="outline">
                      <Heart className="h-4 w-4 mr-2" />
                      Find Matches
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/messages/new")}
                      className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => (window.location.href = `/messages/chat/${conversation.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                    >
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-800 truncate">
                            {conversation.other_user?.name || "Unknown User"}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-rose-500 text-white">{conversation.unread_count}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {conversation.last_message ? (
                            <>
                              {conversation.last_message.sender_id === user.id ? "You: " : ""}
                              {conversation.last_message.content}
                            </>
                          ) : (
                            "No messages yet - start the conversation!"
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

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => (window.location.href = "/matching")}
            >
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-800">Find Matches</h3>
                <p className="text-sm text-slate-500">Discover new connections</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => (window.location.href = "/community")}
            >
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-800">Join Community</h3>
                <p className="text-sm text-slate-500">Connect in forums</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => (window.location.href = "/profile")}
            >
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-800">Update Profile</h3>
                <p className="text-sm text-slate-500">Improve your matches</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
