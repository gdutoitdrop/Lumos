"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MessageCircle, Plus, Users } from "lucide-react"
import { messagingService, type Conversation } from "@/lib/messaging-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void
  selectedConversationId?: string
}

export function ConversationsList({ onSelectConversation, selectedConversationId }: ConversationsListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchConversations = async () => {
      try {
        setError(null)
        const conversations = await messagingService.getUserConversations(user.id)
        setConversations(conversations)
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setError("Failed to load conversations")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.user_id !== user?.id)
  }

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant = getOtherParticipant(conversation)
    if (!otherParticipant?.profile) return false

    const searchLower = searchQuery.toLowerCase()
    return (
      otherParticipant.profile.full_name?.toLowerCase().includes(searchLower) ||
      otherParticipant.profile.username?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h1>
          <Button
            size="sm"
            onClick={() => (window.location.href = "/messages/new")}
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
              {conversations.length === 0 ? "No conversations yet" : "No matches found"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {conversations.length === 0
                ? "Start a conversation with someone from your matches"
                : "Try adjusting your search terms"}
            </p>
            {conversations.length === 0 && (
              <Button
                onClick={() => (window.location.href = "/messages/new")}
                className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const isSelected = selectedConversationId === conversation.id

              return (
                <Card
                  key={conversation.id}
                  className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? "ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={otherParticipant?.profile?.avatar_url || "/placeholder.svg"}
                          alt={otherParticipant?.profile?.full_name || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                          {otherParticipant?.profile?.full_name?.charAt(0) ||
                            otherParticipant?.profile?.username?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-slate-800 dark:text-white truncate">
                            {otherParticipant?.profile?.full_name ||
                              otherParticipant?.profile?.username ||
                              "Unknown User"}
                          </h3>
                          {conversation.last_message && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatLastMessageTime(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                          @{otherParticipant?.profile?.username || "unknown"}
                        </p>

                        {conversation.last_message && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {conversation.last_message.sender_id === user?.id ? "You: " : ""}
                            {conversation.last_message.content}
                          </p>
                        )}

                        {!conversation.last_message && (
                          <p className="text-sm text-slate-400 dark:text-slate-500 italic">No messages yet</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {conversation.participants.length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
