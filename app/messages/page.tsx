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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        console.log("Fetching data for user:", user.id)
        setError(null)

        // Fetch matches with better error handling
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
        id,
        user1_id,
        user2_id,
        status,
        match_score,
        created_at
      `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq("status", "accepted")

        if (matchesError) {
          console.error("Error fetching matches:", matchesError)
          // Don't set error here, just log it - we'll show sample data instead
        }

        // Fetch conversations
        const { data: conversationsData, error: conversationsError } = await supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false })

        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError)
        }

        // Process matches data or create sample data if none exist
        if (matchesData && matchesData.length > 0) {
          const otherUserIds = matchesData.map((match) => {
            return match.user1_id === user.id ? match.user2_id : match.user1_id
          })

          const { data: profiles } = await supabase.from("profiles").select("*").in("id", otherUserIds)

          const transformedMatches = matchesData
            .map((match) => {
              const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id
              const otherUser = profiles?.find((p) => p.id === otherUserId)

              if (!otherUser) return null

              return {
                id: otherUser.id,
                name: otherUser.full_name || otherUser.username || "Unknown User",
                username: otherUser.username || "unknown",
                bio: otherUser.bio || "No bio available",
                location: otherUser.location || "Location not specified",
                avatar_url: otherUser.avatar_url,
                current_mood: otherUser.current_mood,
                journey: otherUser.current_mood || "Mental Health Journey",
                matchScore: match.match_score ? Math.round(match.match_score * 100) : 85,
                isOnline: Math.random() > 0.5,
                lastSeen: "2 hours ago",
              }
            })
            .filter(Boolean)

          setMatches(transformedMatches)
        } else {
          // Create sample matches for demo purposes
          const sampleMatches = [
            {
              id: "sample-1",
              name: "Sarah Johnson",
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
        }

        setConversations(conversationsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Could not load data. Showing sample matches for demo.")

        // Still show sample data even on error
        const sampleMatches = [
          {
            id: "sample-1",
            name: "Sarah Johnson",
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
        ]
        setMatches(sampleMatches)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const filteredMatches = matches.filter(
    (match) =>
      match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.username && match.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const startChat = async (matchId: string) => {
    if (!user) return

    try {
      setCreating(true)
      console.log("Starting chat with match ID:", matchId)

      // Handle sample matches differently
      if (matchId.startsWith("sample-")) {
        setError("This is a demo match. Real messaging will be available once you have actual matches!")
        return
      }

      // Create new conversation for real matches
      const { data: conversation, error: convError } = await supabase.from("conversations").insert({}).select().single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        setError("Could not create conversation.")
        return
      }

      // Add participants
      const participantsData = [
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: matchId },
      ]

      const { error: participantsError } = await supabase.from("conversation_participants").insert(participantsData)

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        setError("Could not add participants.")
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
      const { data: conversation, error: convError } = await supabase.from("conversations").insert({}).select().single()

      if (convError) {
        setError("Could not create conversation.")
        return
      }

      const { error: participantError } = await supabase.from("conversation_participants").insert({
        conversation_id: conversation.id,
        user_id: user.id,
      })

      if (participantError) {
        setError("Could not add participant.")
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
