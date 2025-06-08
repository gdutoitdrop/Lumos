"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function ConversationList() {
  const { user } = useAuth()

  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchMatches = async () => {
      try {
        setLoading(true)

        // Only fetch matches - avoid conversation tables for now
        const { data: matches1 } = await supabase
          .from("matches")
          .select(`
            id,
            match_score,
            matched_profile:profiles!matches_profile_id_2_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("profile_id_1", user.id)
          .eq("status", "accepted")

        const { data: matches2 } = await supabase
          .from("matches")
          .select(`
            id,
            match_score,
            matched_profile:profiles!matches_profile_id_1_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("profile_id_2", user.id)
          .eq("status", "accepted")

        const allMatches = [...(matches1 || []), ...(matches2 || [])]
        setMatches(allMatches)
      } catch (error) {
        console.error("Error fetching matches:", error)
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  const startConversation = (matchedProfileId: string) => {
    // Simple approach: navigate to a conversation page with the match ID
    // This avoids database operations that cause recursion
    window.location.href = `/messages/match-${matchedProfileId}`
  }

  const filteredMatches = matches.filter((match) => {
    const matchName = match.matched_profile?.full_name || match.matched_profile?.username || ""
    return matchName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search your matches"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Your Matches</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Start conversations with people you've matched with
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            <div className="mb-4">
              <Plus className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No matches yet</h3>
              <p className="text-sm">Visit the matching page to find people to connect with</p>
            </div>
            <Button onClick={() => (window.location.href = "/matching")} variant="outline">
              Find Matches
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredMatches.map((match) => (
              <li key={match.id}>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={match.matched_profile?.avatar_url || ""}
                        alt={match.matched_profile?.username || ""}
                      />
                      <AvatarFallback>{match.matched_profile?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {match.matched_profile?.full_name || match.matched_profile?.username}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {Math.round((match.match_score || 0) * 100)}% Match
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startConversation(match.matched_profile.id)}
                      className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                    >
                      Message
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
