"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, Users, Heart, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Try to load real conversations, but don't fail if table doesn't exist
        try {
          const { data: conversationsData } = await supabase
            .from("user_conversations")
            .select(`
              id,
              updated_at,
              user1_id,
              user2_id,
              profiles!user_conversations_user1_id_fkey(username, full_name, avatar_url),
              profiles!user_conversations_user2_id_fkey(username, full_name, avatar_url)
            `)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .order("updated_at", { ascending: false })

          setConversations(conversationsData || [])
        } catch (error) {
          console.error("Conversations table not available:", error)
          setConversations([])
        }

        // Load sample matches for demo
        try {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url, bio")
            .neq("id", user.id)
            .limit(5)

          setMatches(profilesData || [])
        } catch (error) {
          console.error("Error loading profiles:", error)
          // Create demo matches
          setMatches([
            {
              id: "demo-1",
              username: "sarah_j",
              full_name: "Sarah Johnson",
              avatar_url: null,
              bio: "Love hiking and coffee ☕",
            },
            {
              id: "demo-2",
              username: "mike_chen",
              full_name: "Mike Chen",
              avatar_url: null,
              bio: "Photographer and traveler 📸",
            },
          ])
        }
      } catch (error) {
        console.error("Error loading messages data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const filteredMatches = matches.filter(
    (match) =>
      match.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sign in to view messages</h3>
              <p className="text-slate-500 mb-4">Connect with others and start meaningful conversations.</p>
              <Button onClick={() => (window.location.href = "/login")}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Messages</h1>
            <p className="text-slate-500 dark:text-slate-400">Connect and chat with your matches</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/messages/new")}
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Conversations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Active Conversations
                  {conversations.length > 0 && <Badge variant="secondary">{conversations.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No conversations yet</h3>
                    <p className="text-slate-500 mb-4">Start chatting with your matches to see conversations here.</p>
                    <Button variant="outline" onClick={() => (window.location.href = "/matching")}>
                      Find Matches
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => {
                      const otherUser =
                        conversation.user1_id === user.id ? conversation.profiles[1] : conversation.profiles[0]

                      return (
                        <div
                          key={conversation.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          onClick={() => (window.location.href = `/messages/chat/${conversation.id}`)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {otherUser?.full_name?.charAt(0) || otherUser?.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 dark:text-white truncate">
                              {otherUser?.full_name || otherUser?.username || "Unknown User"}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              Click to start chatting...
                            </p>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Matches Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Your Matches
                  {filteredMatches.length > 0 && <Badge variant="secondary">{filteredMatches.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 mb-3">No matches found</p>
                    <Button size="sm" variant="outline" onClick={() => (window.location.href = "/matching")}>
                      Find Matches
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => (window.location.href = `/messages/match-${match.id}`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={match.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            {match.full_name?.charAt(0) || match.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-slate-800 dark:text-white truncate">
                            {match.full_name || match.username}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {match.bio || "Say hello!"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => (window.location.href = "/matching")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Find New Matches
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => (window.location.href = "/profile")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
