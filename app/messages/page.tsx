"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      try {
        console.log("Fetching conversations for user:", user.id)

        // Get all conversations for the current user
        const { data: conversationsData, error } = await supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false })

        if (error) {
          console.error("Error fetching conversations:", error)
          setError("Could not load conversations.")
          return
        }

        console.log("Conversations loaded:", conversationsData)
        setConversations(conversationsData || [])
      } catch (error) {
        console.error("Error in fetchConversations:", error)
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user, supabase])

  const createTestConversation = async () => {
    if (!user) return

    setCreating(true)
    setError(null)

    try {
      console.log("Creating test conversation")

      // Create new conversation
      const { data: conversation, error: convError } = await supabase.from("conversations").insert({}).select().single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        setError("Could not create conversation.")
        return
      }

      console.log("Conversation created:", conversation)

      // Add current user as participant
      const { error: participantError } = await supabase.from("conversation_participants").insert({
        conversation_id: conversation.id,
        user_id: user.id,
      })

      if (participantError) {
        console.error("Error adding participant:", participantError)
        setError("Could not add participant.")
        return
      }

      console.log("Participant added successfully")

      // Navigate to the conversation
      window.location.href = `/messages/chat/${conversation.id}`
    } catch (error) {
      console.error("Error creating conversation:", error)
      setError("An unexpected error occurred.")
    } finally {
      setCreating(false)
    }
  }

  const openConversation = (conversationId: string) => {
    window.location.href = `/messages/chat/${conversationId}`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-500 dark:text-slate-400">Loading conversations...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-700">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Messages</h1>
                <Button
                  size="sm"
                  onClick={createTestConversation}
                  disabled={creating}
                  className="bg-rose-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {creating ? "Creating..." : "New Chat"}
                </Button>
              </div>
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

            {/* Error message */}
            {error && (
              <Alert variant="destructive" className="m-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4">
              {conversations.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                  <MessageCircle className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                  <p className="text-sm mb-4">Start a new conversation to begin messaging</p>
                  <Button onClick={createTestConversation} disabled={creating} className="bg-rose-500 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    {creating ? "Creating..." : "Start New Chat"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Your Conversations ({conversations.length})
                  </h2>
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => openConversation(conversation.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            C
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">Conversation</p>
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            ID: {conversation.id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Created: {new Date(conversation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <MessageCircle className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">Select a conversation</h2>
            <p className="text-slate-500 dark:text-slate-400">Choose a conversation to start messaging</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
