"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function NewConversationModal() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [matches, setMatches] = useState<any[]>([])

  // Fetch matches when modal opens
  useEffect(() => {
    if (!open || !user) return

    const fetchMatches = async () => {
      setLoading(true)
      try {
        // Get matches where user is profile_id_1
        const { data: matches1, error: error1 } = await supabase
          .from("matches")
          .select("*")
          .eq("profile_id_1", user.id)
          .eq("status", "accepted")

        // Get matches where user is profile_id_2
        const { data: matches2, error: error2 } = await supabase
          .from("matches")
          .select("*")
          .eq("profile_id_2", user.id)
          .eq("status", "accepted")

        if (error1) throw error1
        if (error2) throw error2

        // Combine matches
        const allMatches = [...(matches1 || []), ...(matches2 || [])]

        // Get profiles for all matches
        const matchesWithProfiles = []

        for (const match of allMatches) {
          const otherProfileId = match.profile_id_1 === user.id ? match.profile_id_2 : match.profile_id_1

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherProfileId)
            .single()

          if (profileError) continue

          matchesWithProfiles.push({
            ...match,
            profile,
          })
        }

        setMatches(matchesWithProfiles)
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [open, user, supabase])

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      setSearchResults(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Start a conversation with a user
  const startConversation = async (profileId: string) => {
    if (!user) return

    setCreating(true)
    try {
      // Check if conversation already exists
      const { data: existingParticipations, error: participationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id)

      if (participationsError) throw participationsError

      if (existingParticipations && existingParticipations.length > 0) {
        const conversationIds = existingParticipations.map((p) => p.conversation_id)

        const { data: otherParticipations, error: otherParticipationsError } = await supabase
          .from("conversation_participants")
          .select("conversation_id, profile_id")
          .in("conversation_id", conversationIds)
          .eq("profile_id", profileId)

        if (otherParticipationsError) throw otherParticipationsError

        if (otherParticipations && otherParticipations.length > 0) {
          // Conversation already exists, navigate to it
          setOpen(false)
          router.push(`/messages/${otherParticipations[0].conversation_id}`)
          return
        }
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (conversationError) throw conversationError

      // Add participants
      const { error: participantsError } = await supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, profile_id: user.id },
        { conversation_id: conversation.id, profile_id: profileId },
      ])

      if (participantsError) throw participantsError

      // Navigate to the conversation
      setOpen(false)
      router.push(`/messages/${conversation.id}`)
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Search Results</h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || ""} alt={profile.username || ""} />
                        <AvatarFallback>{profile.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.full_name || profile.username}</p>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => startConversation(profile.id)} disabled={creating}>
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground">No users found</p>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Your Matches</h3>
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : matches.length > 0 ? (
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={match.profile.avatar_url || ""} alt={match.profile.username || ""} />
                        <AvatarFallback>{match.profile.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{match.profile.full_name || match.profile.username}</p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                          >
                            {Math.round(match.match_score * 100)}% Match
                          </Badge>
                        </div>
                        {match.profile.current_mood && (
                          <p className="text-sm text-muted-foreground">{match.profile.current_mood}</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => startConversation(match.profile.id)} disabled={creating}>
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No matches found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
