"use client"

import { startConversation } from "@/actions/messaging"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Match = Database["public"]["Tables"]["matches"]["Row"] & {
  matched_profile: {
    id: string
    full_name: string
    bio: string
    avatar_url: string | null
    gender: string | null
  }
}

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadMatches() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          matched_profile:profiles!matches_user2_id_fkey(
            id, full_name, bio, avatar_url, gender
          )
        `)
        .eq("user1_id", user.id)
        .eq("status", "matched")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading matches:", error)
        return
      }

      // Also get matches where the user is user2
      const { data: data2, error: error2 } = await supabase
        .from("matches")
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          matched_profile:profiles!matches_user1_id_fkey(
            id, full_name, bio, avatar_url, gender
          )
        `)
        .eq("user2_id", user.id)
        .eq("status", "matched")
        .order("created_at", { ascending: false })

      if (error2) {
        console.error("Error loading matches:", error2)
        return
      }

      setMatches([...data, ...data2])
      setLoading(false)
    }

    loadMatches()
  }, [supabase])

  const handleMessage = async (matchId: string) => {
    setMessaging(matchId)
    try {
      const result = await startConversation(matchId)
      if (result.error) {
        console.error("Error starting conversation:", result.error)
        return
      }

      if (result.conversationId) {
        router.push(`/messages/${result.conversationId}`)
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
    } finally {
      setMessaging(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-1/3 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 w-full bg-muted rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No matches yet</CardTitle>
          <CardDescription>Complete your profile and preferences to start matching with others</CardDescription>
        </CardHeader>
        <CardContent>
          <p>When you match with someone, they will appear here. You can then start a conversation with them.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push("/matching/preferences")}>
            Update Preferences
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={match.matched_profile.avatar_url || undefined}
                  alt={match.matched_profile.full_name}
                />
                <AvatarFallback>{match.matched_profile.full_name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              {match.matched_profile.full_name}
            </CardTitle>
            <CardDescription>{match.matched_profile.gender || "Not specified"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3">{match.matched_profile.bio || "No bio provided"}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleMessage(match.id)} disabled={messaging === match.id}>
              {messaging === match.id ? (
                "Starting chat..."
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
