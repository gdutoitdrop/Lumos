"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { messagingService, type Conversation } from "@/lib/messaging-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Plus, Users, Heart } from "lucide-react"
import Link from "next/link"

export default function MessagesPage() {
  const { user } = useAuth()
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
        const userConversations = await messagingService.getUserConversations(user.id)
        setConversations(userConversations)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setConversations([])
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
      conv.other_user.full_name?.toLowerCase().includes(searchLower) ||
      conv.other_user.username?.toLowerCase().includes(searchLower)
    )
  })

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
      window.location.href = `/messages/${conversation.id}`
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
              asChild
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              <Link href="/login">Go to Login</Link>
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
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-rose-500" />
                  Messages
                  {conversations.length > 0 && <Badge variant="secondary">{conversations.length}</Badge>}
                </CardTitle>
                <Button
                  asChild
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                >
                  <Link href="/matching">
                    <Plus className="h-4 w-4 mr-2" />
                    Find Matches
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conversations */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-slate-600 mb-2">
                    {searchQuery ? "No conversations found" : "No messages yet"}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Start connecting with people to begin conversations"}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
                      <Link href="/matching">
                        <Heart className="h-4 w-4" />
                        Find Matches
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                    >
                      <Link href="/community">
                        <Users className="h-4 w-4 mr-2" />
                        Join Community
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={conversation.other_user.avatar_url || "/placeholder.svg"}
                            alt={conversation.other_user.full_name || conversation.other_user.username}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            {(conversation.other_user.full_name || conversation.other_user.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-slate-800 truncate">
                              {conversation.other_user.full_name || conversation.other_user.username}
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

                          <p className="text-sm text-slate-500 mb-1">@{conversation.other_user.username}</p>

                          {conversation.last_message && (
                            <p className="text-sm text-slate-600 truncate">
                              {conversation.last_message.sender_id === user.id ? "You: " : ""}
                              {conversation.last_message.content}
                            </p>
                          )}
                        </div>
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
