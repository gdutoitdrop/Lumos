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
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (userId) {
      loadConversations()
    }
  }, [userId])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const data = await messagingService.getUserConversations(userId)
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTestConversation = async () => {
    if (creating) return

    setCreating(true)
    try {
      const conversationId = await messagingService.createConversation([userId, "22222222-2222-2222-2222-222222222222"])

      if (conversationId) {
        // Send welcome message
        await messagingService.sendMessage(
          conversationId,
          "22222222-2222-2222-2222-222222222222",
          "Hello! This is a test conversation. You can start chatting here.",
        )

        // Reload and select
        await loadConversations()
        onSelectConversation(conversationId)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-rose-50 to-amber-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <Button
            onClick={createTestConversation}
            disabled={creating}
            size="sm"
            className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600"
          >
            <Plus className="h-4 w-4 mr-1" />
            {creating ? "Creating..." : "New"}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">No conversations</h3>
            <p className="text-sm text-gray-500 mb-4">Start a new conversation</p>
            <Button
              onClick={createTestConversation}
              disabled={creating}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Start Chat"}
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  selectedConversationId === conversation.id ? "ring-2 ring-rose-500 bg-rose-50" : "hover:bg-gray-50"
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                        T
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">Test User</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
