"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, X, MessageCircle, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { generateMatches } from "@/app/actions"

export function MatchList() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [matches, setMatches] = useState<any[]>([])
  const [pendingMatches, setPendingMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingMatches, setGeneratingMatches] = useState(false)
  const [matchGenMessage, setMatchGenMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return

      setLoading(true)

      try {
        // Get matches where the user is profile_id_1
        const { data: matches1, error: error1 } = await supabase
          .from("matches")
          .select("*")
          .eq("profile_id_1", user.id)
          .eq("status", "accepted")

        // Get matches where the user is profile_id_2
        const { data: matches2, error: error2 } = await supabase
          .from("matches")
          .select("*")
          .eq("profile_id_2", user.id)
          .eq("status", "accepted")

        if (error1) throw error1
        if (error2) throw error2

        // Get pending matches (where user is profile_id_2)
        const { data: pendingData, error: pendingError } = await supabase
          .from("matches")
          .select("*")
          .eq("profile_id_2", user.id)
          .eq("status", "pending")

        if (pendingError) throw pendingError

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
            matched_profile: profile,
          })
        }

        // Get profiles for pending matches
        const pendingWithProfiles = []

        for (const match of pendingData || []) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", match.profile_id_1)
            .single()

          if (profileError) continue

          pendingWithProfiles.push({
            ...match,
            matched_profile: profile,
          })
        }

        setMatches(matchesWithProfiles)
        setPendingMatches(pendingWithProfiles)
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user, supabase])

  const handleAcceptMatch = async (matchId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", matchId)

      if (error) throw error

      // Refresh matches
      setPendingMatches((prev) => prev.filter((match) => match.id !== matchId))

      // Get the match
      const match = pendingMatches.find((m) => m.id === matchId)

      if (match) {
        setMatches((prev) => [...prev, match])
      }
    } catch (error) {
      console.error("Error accepting match:", error)
    }
  }

  const handleRejectMatch = async (matchId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", matchId)

      if (error) throw error

      // Remove from pending matches
      setPendingMatches((prev) => prev.filter((match) => match.id !== matchId))
    } catch (error) {
      console.error("Error rejecting match:", error)
    }
  }

  const handleGenerateMatches = async () => {
    setGeneratingMatches(true)
    setMatchGenMessage(null)

    try {
      const result = await generateMatches()

      if (result.error) {
        setMatchGenMessage(`Error: ${result.error}`)
      } else if (result.matchesGenerated === 0) {
        setMatchGenMessage("No new matches found. Try updating your preferences.")
      } else {
        setMatchGenMessage(`Generated ${result.matchesGenerated} new potential matches!`)
        // Refresh the page to show new matches
        router.refresh()
      }
    } catch (error) {
      console.error("Error generating matches:", error)
      setMatchGenMessage("An error occurred while generating matches.")
    } finally {
      setGeneratingMatches(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Loading matches...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Find New Matches</h2>
        <Button
          onClick={handleGenerateMatches}
          className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
          disabled={generatingMatches}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${generatingMatches ? "animate-spin" : ""}`} />
          {generatingMatches ? "Finding Matches..." : "Find Matches"}
        </Button>
      </div>

      {matchGenMessage && (
        <div
          className={`p-4 rounded-lg ${
            matchGenMessage.startsWith("Error")
              ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
          }`}
        >
          {matchGenMessage}
        </div>
      )}

      {pendingMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingMatches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage
                      src={match.matched_profile.avatar_url || ""}
                      alt={match.matched_profile.username || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none text-4xl">
                      {match.matched_profile.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {match.matched_profile.full_name || match.matched_profile.username}
                      </h3>
                      {match.matched_profile.current_mood && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {match.matched_profile.current_mood}
                        </p>
                      )}
                    </div>
                    <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm px-2 py-1 rounded-full">
                      {Math.round(match.match_score * 100)}% Match
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {match.matched_profile.mental_health_badges?.slice(0, 3).map((badge) => (
                      <Badge
                        key={badge}
                        variant="outline"
                        className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                      >
                        {badge}
                      </Badge>
                    ))}
                    {(match.matched_profile.mental_health_badges?.length || 0) > 3 && (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300"
                      >
                        +{(match.matched_profile.mental_health_badges?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                    {match.matched_profile.bio || "No bio provided"}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRejectMatch(match.id)}
                      variant="outline"
                      className="flex-1 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20"
                    >
                      <X className="mr-2 h-4 w-4 text-rose-500" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAcceptMatch(match.id)}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Matches</h2>
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-slate-500 dark:text-slate-400">
              No matches yet. Update your preferences to find more matches!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage
                      src={match.matched_profile.avatar_url || ""}
                      alt={match.matched_profile.username || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-none text-4xl">
                      {match.matched_profile.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {match.matched_profile.full_name || match.matched_profile.username}
                      </h3>
                      {match.matched_profile.current_mood && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {match.matched_profile.current_mood}
                        </p>
                      )}
                    </div>
                    <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm px-2 py-1 rounded-full">
                      {Math.round(match.match_score * 100)}% Match
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {match.matched_profile.mental_health_badges?.slice(0, 3).map((badge) => (
                      <Badge
                        key={badge}
                        variant="outline"
                        className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                      >
                        {badge}
                      </Badge>
                    ))}
                    {(match.matched_profile.mental_health_badges?.length || 0) > 3 && (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300"
                      >
                        +{(match.matched_profile.mental_health_badges?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                    {match.matched_profile.bio || "No bio provided"}
                  </p>

                  <Button
                    onClick={() => router.push(`/messages`)}
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
