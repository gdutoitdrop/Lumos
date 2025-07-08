"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageCircle, Plus } from "lucide-react"
import { messagingService, type Conversation } from "@/lib/simple-messaging"

interface ConversationListProps {
  userId: string
  onSelectConversation: (conversationId: string) => void
  selectedConversationId?: string
}

export function SimpleConversationList({
  userId,
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [userId])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await messagingService.getUserConversations(userId)
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTestConversation = async () => {
    try {
      const conversationId = await messagingService.createConversation([
        userId,
        "22222222-2222-2222-2222-222222222222", // Test user
      ])

      if (conversationId) {
        // Send a welcome message
        await messagingService.sendMessage(
          conversationId,
          "22222222-2222-2222-2222-222222222222",
          "Hello! This is a test conversation. You can start chatting here.",
        )

        // Reload conversations
        await loadConversations()

        // Select the new conversation
        onSelectConversation(conversationId)
      }
    } catch (error) {
      console.error("Error creating test conversation:", error)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants?.find((p) => p.user_id !== userId)
    const name = otherParticipant?.profiles?.full_name || otherParticipant?.profiles?.username || "Unknown"
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
            Messages
          </h2>
          <Button
            onClick={createTestConversation}
            size="sm"
            className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 mb-4">Start a new conversation to begin messaging</p>
            <Button
              onClick={createTestConversation}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Test Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants?.find((p) => p.user_id !== userId)
              const name =
                otherParticipant?.profiles?.full_name || otherParticipant?.profiles?.username || "Unknown User"
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()

              return (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedConversationId === conversation.id ? "ring-2 ring-rose-500 bg-rose-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message?.content || "No messages yet"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(conversation.updated_at).toLocaleDateString()}
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
