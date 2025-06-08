"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Heart, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return

      try {
        // Fetch accepted matches with profile information
        const { data: matchesData, error } = await supabase
          .from("matches")
          .select(`
            *,
            user1:profiles!matches_user1_id_fkey(id, username, full_name, bio, avatar_url, gender, location),
            user2:profiles!matches_user2_id_fkey(id, username, full_name, bio, avatar_url, gender, location)
          `)
          .eq("status", "accepted")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

        if (error) {
          console.error("Error fetching matches:", error)
          return
        }

        // Transform matches to get the other user's profile
        const transformedMatches =
          matchesData?.map((match) => {
            const otherUser = match.user1_id === user.id ? match.user2 : match.user1
            return {
              id: otherUser.id,
              name: otherUser.full_name || otherUser.username || "Unknown User",
              username: otherUser.username || "unknown",
              bio: otherUser.bio || "No bio available",
              location: otherUser.location || "Location not specified",
              avatar_url: otherUser.avatar_url,
              gender: otherUser.gender,
              journey: "Mental Health Journey", // You can add this to profiles table
              matchScore: 85 + Math.floor(Math.random() * 15), // Random score for demo
              isOnline: Math.random() > 0.5, // Random online status for demo
            }
          }) || []

        setMatches(transformedMatches)
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user, supabase])

  const filteredMatches = matches.filter(
    (match) =>
      match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const startChat = async (matchId: string) => {
    if (!user) return

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id)
        .in(
          "conversation_id",
          supabase.from("conversation_participants").select("conversation_id").eq("user_id", matchId),
        )
        .single()

      if (existingConversation) {
        // Navigate to existing conversation
        window.location.href = `/messages/chat/${existingConversation.conversation_id}`
        return
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase.from("conversations").insert({}).select().single()

      if (convError) throw convError

      // Add participants
      const { error: participantsError } = await supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: matchId },
      ])

      if (participantsError) throw participantsError

      // Navigate to new conversation
      window.location.href = `/messages/chat/${conversation.id}`
    } catch (error) {
      console.error("Error creating conversation:", error)
      alert("Unable to start conversation. Please try again.")
    }
  }

  const viewProfile = (matchId: string) => {
    window.location.href = `/profile/${matchId}`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-500 dark:text-slate-400">Loading matches...</p>
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
              <h1 className="text-xl font-bold mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search matches"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Matches List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredMatches.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                  <Heart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No matches found</h3>
                  <p className="text-sm">
                    {matches.length === 0 ? "You don't have any matches yet" : "Try adjusting your search"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Your Matches ({filteredMatches.length})
                  </h2>
                  {filteredMatches.map((match) => (
                    <div
                      key={match.id}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            {match.avatar_url ? (
                              <img
                                src={match.avatar_url || "/placeholder.svg"}
                                alt={match.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                                {match.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {match.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">{match.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {match.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            @{match.username} • {match.location}
                          </p>
                          <Badge variant="secondary" className="text-xs mb-2">
                            {match.journey}
                          </Badge>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{match.bio}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => startChat(match.id)}
                          className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => viewProfile(match.id)}>
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
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
            <p className="text-slate-500 dark:text-slate-400">Choose someone from your matches to start chatting</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
