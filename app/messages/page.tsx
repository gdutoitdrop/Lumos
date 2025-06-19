"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MessageCircle, Heart, User, Plus, Clock, AlertCircle } from "lucide-react"
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
  const [debugInfo, setDebugInfo] = useState<string>("")
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError("Please log in to view messages")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching data for user:", user.id)
        setError(null)
        setDebugInfo(`User ID: ${user.id}`)

        // Create sample matches for demo
        const sampleMatches = [
          {
            id: "sample-1",
            full_name: "Sarah Johnson",
            username: "sarah_j",
            bio: "Mental health advocate and yoga instructor. Love connecting with like-minded people on their wellness journey.",
            location: "San Francisco, CA",
            avatar_url: null,
            current_mood: "Optimistic",
            journey: "Anxiety Support",
            matchScore: 92,
            isOnline: true,
            lastSeen: "Online now",
          },
          {
            id: "sample-2",
            name: "Alex Chen",
            username: "alex_mindful",
            bio: "Meditation practitioner and mental health peer supporter. Here to listen and share experiences.",
            location: "Seattle, WA",
            avatar_url: null,
            current_mood: "Peaceful",
            journey: "Depression Recovery",
            matchScore: 88,
            isOnline: false,
            lastSeen: "1 hour ago",
          },
          {
            id: "sample-3",
            name: "Maya Patel",
            username: "maya_wellness",
            bio: "Therapist and wellness coach. Passionate about creating safe spaces for mental health conversations.",
            location: "Austin, TX",
            avatar_url: null,
            current_mood: "Supportive",
            journey: "Professional Support",
            matchScore: 95,
            isOnline: true,
            lastSeen: "Online now",
          },
        ]

        setMatches(sampleMatches)

        // Fetch real conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from("user_conversations")
          .select("*")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .order("updated_at", { ascending: false })

        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError)
          setDebugInfo((prev) => prev + `\nConversations Error: ${conversationsError.message}`)
        } else {
          setConversations(conversationsData || [])
          setDebugInfo((prev) => prev + `\nConversations found: ${conversationsData?.length || 0}`)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Could not load data. Please try again.")
        setDebugInfo((prev) => prev + `\nGeneral Error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const filteredMatches = matches.filter(
    (match) =>
      (match.full_name || match.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.username || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const startChat = async (matchId: string) => {
    if (!user) {
      setError("Please log in to start a conversation")
      return
    }

    try {
      setCreating(true)
      setError(null)
      console.log("Starting chat with match ID:", matchId)

      // Handle sample matches differently
      if (matchId.startsWith("sample-")) {
        // Create a test conversation with a fixed ID
        const testConversationId = "test-conversation-" + Date.now()

        const { data: conversation, error: convError } = await supabase
          .from("user_conversations")
          .insert({
            id: testConversationId,
            participant_1: user.id,
            participant_2: "22222222-2222-2222-2222-222222222222", // Sample user ID
          })
          .select()
          .single()

        if (convError) {
          console.error("Error creating conversation:", convError)
          setError(`Could not create conversation: ${convError.message}`)
          setDebugInfo((prev) => prev + `\nConversation Error: ${convError.message}`)
          return
        }

        console.log("Conversation created:", conversation)
        window.location.href = `/messages/chat/${conversation.id}`
        return
      }

      // For real matches
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
        setError(`Could not create conversation: ${convError.message}`)
        return
      }

      window.location.href = `/messages/chat/${conversation.id}`
    } catch (error) {
      console.error("Error in startChat:", error)
      setError("An unexpected error occurred while starting the conversation.")
    } finally {
      setCreating(false)
    }
  }

  const createTestConversation = async () => {
    if (!user) {
      setError("Please log in to create a conversation")
      return
    }

    setCreating(true)
    setError(null)

    try {
      console.log("Creating test conversation for user:", user.id)

      const { data: conversation, error: convError } = await supabase
        .from("user_conversations")
        .insert({
          participant_1: user.id,
          participant_2: "22222222-2222-2222-2222-222222222222", // Sample user
        })
        .select()
        .single()

      if (convError) {
        console.error("Error creating test conversation:", convError)
        setError(`Could not create conversation: ${convError.message}`)
        setDebugInfo((prev) => prev + `\nTest Conversation Error: ${convError.message}`)
        return
      }

      console.log("Test conversation created:", conversation)
      window.location.href = `/messages/chat/${conversation.id}`
    } catch (error) {
      console.error("Error creating test conversation:", error)
      setError("An unexpected error occurred.")
    } finally {
      setCreating(false)
    }
  }

  const viewProfile = (matchId: string) => {
    if (matchId.startsWith("sample-")) {
      setError("This is a demo profile. Real profiles will be available once you have actual matches!")
      return
    }
    window.location.href = `/profile/${matchId}`
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
            <p className="text-slate-500 dark:text-slate-400">Loading your matches and conversations...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)]">
              {/* Left Sidebar - Matches and Conversations */}
              <div className="w-full lg:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0">
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
                      placeholder="Search matches..."
                      className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <Alert variant="destructive" className="m-4 flex-shrink-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Debug info for development */}
                {debugInfo && (
                  <Alert className="m-4 flex-shrink-0">
                    <AlertDescription>
                      <details>
                        <summary className="cursor-pointer">Debug Info</summary>
                        <pre className="text-xs mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                      </details>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Content - Scrollable */}
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
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-600">
                                    {match.avatar_url ? (
                                      <AvatarImage
                                        src={match.avatar_url || "/placeholder.svg"}
                                        alt={match.full_name || match.name}
                                      />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-lg font-semibold">
                                        {(match.full_name || match.name || "U").charAt(0)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  {match.isOnline && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-700 rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                      {match.full_name || match.name}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 border-rose-200 text-xs"
                                    >
                                      {match.matchScore}% Match
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                                    @{match.username} • {match.location}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mb-2 border-slate-300 dark:border-slate-500"
                                  >
                                    {match.journey}
                                  </Badge>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                    {match.bio}
                                  </p>
                                  <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 mb-2">
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
                                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm text-xs"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {creating ? "Starting..." : "Message"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewProfile(match.id)}
                                  className="border-slate-300 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 text-xs"
                                >
                                  <User className="h-3 w-3 mr-1" />
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
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    C
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-medium text-slate-800 dark:text-white">Conversation</h3>
                                    <Badge variant="outline" className="text-xs">
                                      Active
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
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
                </div>
              </div>

              {/* Right Side - Empty State */}
              <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
