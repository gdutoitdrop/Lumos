"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MessageCircle, Heart, User, Plus, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [matches, setMatches] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        console.log("Fetching data for user:", user.id)
        setError(null)

        // Fetch matches with better error handling
        const { data: matchesData, error: matchesError } = await supabase
          .from("profiles")
          .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        current_mood
      `)
          .neq("id", user.id)

        if (matchesError) {
          console.error("Error fetching matches:", matchesError)
          setError("Could not load matches.")
          return
        }

        // Fetch conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from("user_conversations")
          .select("*")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .order("updated_at", { ascending: false })

        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError)
        }

        setMatches(matchesData || [])
        setConversations(conversationsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Could not load data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const filteredMatches = matches.filter(
    (match) =>
      match.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const startChat = async (matchId: string) => {
    if (!user) return

    try {
      setCreating(true)
      console.log("Starting chat with match ID:", matchId)

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("user_conversations")
        .insert({
          participant_1: user.id,
          participant_2: matchId,
        })
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        setError("Could not create conversation.")
        return
      }

      // Navigate to conversation
      window.location.href = `/messages/chat/${conversation.id}`
    } catch (error) {
      console.error("Error in startChat:", error)
      setError("An unexpected error occurred.")
    } finally {
      setCreating(false)
    }
  }

  const createTestConversation = async () => {
    if (!user) return

    setCreating(true)
    setError(null)

    try {
      const { data: conversation, error: convError } = await supabase
        .from("user_conversations")
        .insert({
          participant_1: user.id,
          participant_2: "22222222-2222-2222-2222-222222222222", // Sample user
        })
        .select()
        .single()

      if (convError) {
        setError("Could not create conversation.")
        return
      }

      window.location.href = `/messages/chat/${conversation.id}`
    } catch (error) {
      setError("An unexpected error occurred.")
    } finally {
      setCreating(false)
    }
  }

  const viewProfile = (matchId: string) => {
    window.location.href = `/profile/${matchId}`
  }

  const openConversation = (conversationId: string) => {
    window.location.href = `/messages/chat/${conversationId}`
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Left Sidebar - Matches and Conversations */}
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
                  <Plus className="h-4 w-4 mr-2" />
                  {creating ? "Creating..." : "New Chat"}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search matches and conversations..."
                  className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Matches Section */}
              {filteredMatches.length > 0 && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-rose-500" />
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
                            <div className="relative">
                              <Avatar className="h-14 w-14 ring-2 ring-slate-200 dark:ring-slate-600">
                                {match.avatar_url ? (
                                  <AvatarImage src={match.avatar_url || "/placeholder.svg"} alt={match.name} />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-lg font-semibold">
                                    {match.name.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              {match.isOnline && (
                                <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-700 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate">
                                  {match.name}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 border-rose-200"
                                >
                                  {match.matchScore}% Match
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                                @{match.username} • {match.location}
                              </p>
                              <Badge variant="outline" className="text-xs mb-2 border-slate-300 dark:border-slate-500">
                                {match.journey}
                              </Badge>
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                {match.bio}
                              </p>
                              <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mb-3">
                                <Clock className="h-3 w-3 mr-1" />
                                {match.isOnline ? "Online now" : `Last seen ${match.lastSeen}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => startChat(match.id)}
                              disabled={creating}
                              className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {creating ? "Starting..." : "Message"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewProfile(match.id)}
                              className="border-slate-300 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversations Section */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Recent Conversations ({conversations.length})
                </h2>
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
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
                      <Plus className="h-4 w-4 mr-2" />
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
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                C
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-base font-medium text-slate-800 dark:text-white">Conversation</h3>
                                <Badge variant="outline" className="text-xs">
                                  Active
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                ID: {conversation.id.slice(0, 8)}...
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
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

              {/* No matches state */}
              {filteredMatches.length === 0 && matches.length === 0 && (
                <div className="p-4">
                  <div className="text-center py-8">
                    <Heart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No matches yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Visit the matching page to find people to connect with
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/matching")}
                      variant="outline"
                      className="border-slate-300 dark:border-slate-500"
                    >
                      Find Matches
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Empty State */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <div className="text-center max-w-md">
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-300">Select a conversation</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Choose someone from your matches to start chatting, or create a new conversation
            </p>
            <Button
              onClick={createTestConversation}
              disabled={creating}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Start New Chat"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
