"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MessageCircle, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { messagingService } from "@/lib/messaging-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function NewConversation() {
  const { user } = useAuth()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([])
      return
    }

    const searchUsers = async () => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id)
          .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .limit(10)

        if (error) throw error

        setUsers(profiles || [])
      } catch (error) {
        console.error("Error searching users:", error)
        setError("Failed to search users")
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, user, supabase])

  const startConversation = async (otherUserId: string) => {
    if (!user) return

    setCreating(true)
    setError(null)

    try {
      const conversationId = await messagingService.createConversation(user.id, otherUserId)
      window.location.href = `/messages?conversation=${conversationId}`
    } catch (error) {
      console.error("Error creating conversation:", error)
      setError("Failed to create conversation")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => (window.location.href = "/messages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">New Conversation</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search users by name or username..."
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!searchQuery.trim() ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Search for users</h3>
            <p className="text-slate-500 dark:text-slate-400">Enter a name or username to find people to message</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Searching users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No users found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try searching with different terms</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((profile) => (
              <Card
                key={profile.id}
                className="hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt={profile.full_name || profile.username}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                          {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium text-slate-800 dark:text-white">
                          {profile.full_name || profile.username || "Unknown User"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">@{profile.username || "unknown"}</p>
                        {profile.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{profile.bio}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startConversation(profile.id)}
                      disabled={creating}
                      className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {creating ? "Starting..." : "Message"}
                    </Button>
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
