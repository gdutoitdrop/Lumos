"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, UserPlus, UserMinus, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PublicProfileProps {
  userId: string
}

export function PublicProfile({ userId }: PublicProfileProps) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchStatus, setMatchStatus] = useState<"none" | "pending" | "accepted" | "rejected">("none")
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return

      setLoading(true)
      setError(null)

      try {
        // Check if this is the current user
        if (user && user.id === userId) {
          setIsCurrentUser(true)
        }

        // Get the profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)

        // If logged in, check match status
        if (user && user.id !== userId) {
          // Check if there's a match where current user is profile_id_1
          const { data: match1, error: match1Error } = await supabase
            .from("matches")
            .select("*")
            .eq("profile_id_1", user.id)
            .eq("profile_id_2", userId)
            .single()

          if (!match1Error && match1) {
            setMatchStatus(match1.status)
          } else {
            // Check if there's a match where current user is profile_id_2
            const { data: match2, error: match2Error } = await supabase
              .from("matches")
              .select("*")
              .eq("profile_id_1", userId)
              .eq("profile_id_2", user.id)
              .single()

            if (!match2Error && match2) {
              setMatchStatus(match2.status)
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, user, supabase])

  const startConversation = async () => {
    if (!user || !profile) return

    setActionLoading(true)
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
          .eq("profile_id", profile.id)

        if (otherParticipationsError) throw otherParticipationsError

        if (otherParticipations && otherParticipations.length > 0) {
          // Conversation already exists, navigate to it
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
        { conversation_id: conversation.id, profile_id: profile.id },
      ])

      if (participantsError) throw participantsError

      // Navigate to the conversation
      router.push(`/messages/${conversation.id}`)
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const createMatch = async () => {
    if (!user || !profile) return

    setActionLoading(true)
    try {
      const { error } = await supabase.from("matches").insert({
        profile_id_1: user.id,
        profile_id_2: profile.id,
        match_score: 0.7, // Default score
        status: "pending",
      })

      if (error) throw error

      setMatchStatus("pending")
    } catch (error) {
      console.error("Error creating match:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const removeMatch = async () => {
    if (!user || !profile) return

    setActionLoading(true)
    try {
      // Update match where current user is profile_id_1
      await supabase
        .from("matches")
        .update({ status: "rejected" })
        .eq("profile_id_1", user.id)
        .eq("profile_id_2", profile.id)

      // Update match where current user is profile_id_2
      await supabase
        .from("matches")
        .update({ status: "rejected" })
        .eq("profile_id_1", profile.id)
        .eq("profile_id_2", user.id)

      setMatchStatus("rejected")
    } catch (error) {
      console.error("Error removing match:", error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {error || "This profile doesn't exist or was deleted."}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.username || ""} />
              <AvatarFallback className="text-2xl">{profile.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.full_name || profile.username}</CardTitle>
              <p className="text-slate-500 dark:text-slate-400">@{profile.username}</p>
              {profile.current_mood && (
                <p className="text-slate-600 dark:text-slate-300 mt-1">Mood: {profile.current_mood}</p>
              )}
            </div>

            {!isCurrentUser && user && (
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button
                  onClick={startConversation}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  disabled={actionLoading}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>

                {matchStatus === "none" && (
                  <Button onClick={createMatch} variant="outline" disabled={actionLoading}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}

                {matchStatus === "pending" && (
                  <Button variant="outline" disabled>
                    Connection Pending
                  </Button>
                )}

                {matchStatus === "accepted" && (
                  <Button onClick={removeMatch} variant="outline" disabled={actionLoading}>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Connection
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Bio</h3>
                  <p className="text-slate-600 dark:text-slate-300">{profile.bio || "No bio provided."}</p>
                </div>

                {profile.gender && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Gender</h3>
                    <p className="text-slate-600 dark:text-slate-300">{profile.gender}</p>
                  </div>
                )}

                {profile.looking_for && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Looking For</h3>
                    <p className="text-slate-600 dark:text-slate-300">{profile.looking_for}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="mental-health" className="pt-4">
              <div className="space-y-4">
                {profile.mental_health_badges && profile.mental_health_badges.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mental Health Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.mental_health_badges.map((badge: string) => (
                        <Badge key={badge} className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No mental health badges selected.</p>
                )}

                {profile.mental_health_journey && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mental Health Journey</h3>
                    <p className="text-slate-600 dark:text-slate-300">{profile.mental_health_journey}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
