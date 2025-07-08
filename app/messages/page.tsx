"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MessageThread } from "@/components/messaging/message-thread"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Sample matches for demo
  const sampleMatches = [
    {
      id: "sample-1",
      name: "Sarah Johnson",
      username: "sarah_j",
      bio: "Mental health advocate and yoga instructor.",
      location: "San Francisco, CA",
      avatar_url: null,
      journey: "Anxiety Support",
      matchScore: 92,
      isOnline: true,
    },
    {
      id: "sample-2",
      name: "Alex Chen",
      username: "alex_mindful",
      bio: "Meditation practitioner and peer supporter.",
      location: "Seattle, WA",
      avatar_url: null,
      journey: "Depression Recovery",
      matchScore: 88,
      isOnline: false,
    },
    {
      id: "sample-3",
      name: "Maya Patel",
      username: "maya_wellness",
      bio: "Therapist and wellness coach.",
      location: "Austin, TX",
      avatar_url: null,
      journey: "Professional Support",
      matchScore: 95,
      isOnline: true,
    },
  ]

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data: conversationsData } = await supabase
          .from("user_conversations")
          .select("*")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .order("updated_at", { ascending: false })

        setConversations(conversationsData || [])
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user, supabase])

  useEffect(() => {
    // Check if there's a conversation ID in the URL
    const conversationId = searchParams.get("conversation")
    if (conversationId) {
      setSelectedConversationId(conversationId)
    }
  }, [searchParams])

  const filteredMatches = sampleMatches.filter(
    (match) =>
      match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const createTestConversation = async () => {
    if (!user) return

    setCreating(true)

    try {
      const { data: conversation, error } = await supabase
        .from("user_conversations")
        .insert({
          participant_1: user.id,
          participant_2: "22222222-2222-2222-2222-222222222222",
        })
        .select()
        .single()

      if (!error && conversation) {
        window.location.href = `/messages/chat/${conversation.id}`
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  const startChat = async (matchId: string) => {
    if (!user) return

    setCreating(true)

    try {
      const { data: conversation, error } = await supabase
        .from("user_conversations")
        .insert({
          participant_1: user.id,
          participant_2: matchId.startsWith("sample-") ? "22222222-2222-2222-2222-222222222222" : matchId,
        })
        .select()
        .single()

      if (!error && conversation) {
        window.location.href = `/messages/chat/${conversation.id}`
      }
    } catch (error) {
      console.error("Error starting chat:", error)
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Messages</h1>
                <Button
                  size="sm"
                  onClick={createTestConversation}
                  disabled={creating}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md"
                >
                  {/* Plus Icon */}
                  {creating ? "Creating..." : "New Chat"}
                </Button>
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search matches..."
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Matches Section */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                  {/* Heart Icon */}
                  Your Matches ({filteredMatches.length})
                </h2>
                <div className="space-y-3">
                  {filteredMatches.map((match) => (
                    <Card
                      key={match.id}
                      className="hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-lg font-semibold">
                              {match.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                {match.name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {match.matchScore}% Match
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                              @{match.username} • {match.location}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{match.bio}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => startChat(match.id)}
                            disabled={creating}
                            className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs"
                          >
                            {/* MessageCircle Icon */}
                            {creating ? "Starting..." : "Message"}
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs bg-transparent">
                            {/* User Icon */}
                            Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Conversations Section */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                  {/* MessageCircle Icon */}
                  Recent Conversations ({conversations.length})
                </h2>
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    {/* MessageCircle Icon */}
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Start messaging your matches to begin conversations
                    </p>
                    <Button
                      onClick={createTestConversation}
                      disabled={creating}
                      className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                    >
                      {/* Plus Icon */}
                      {creating ? "Creating..." : "Start New Chat"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className="hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                        onClick={() => openConversation(conversation.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                C
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-slate-800 dark:text-white">Conversation</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Created: {new Date(conversation.created_at).toLocaleDateString()}
                              </p>
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
        </div>

        {/* Right Side - Message Thread or Empty State */}
        <div className="hidden md:flex flex-1">
          {selectedConversationId ? (
            <MessageThread conversationId={selectedConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center max-w-md">
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-300">Select a conversation</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
