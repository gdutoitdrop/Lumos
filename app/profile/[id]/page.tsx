"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, UserPlus, ArrowLeft, Heart, MapPin, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error fetching profile:", error)
          return
        }

        setProfile(profileData)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, supabase])

  const startConversation = async () => {
    if (!user) return

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id)
        .in(
          "conversation_id",
          supabase.from("conversation_participants").select("conversation_id").eq("user_id", userId),
        )
        .single()

      if (existingConversation) {
        router.push(`/messages/chat/${existingConversation.conversation_id}`)
        return
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase.from("conversations").insert({}).select().single()

      if (convError) throw convError

      // Add participants
      const { error: participantsError } = await supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: userId },
      ])

      if (participantsError) throw participantsError

      router.push(`/messages/chat/${conversation.id}`)
    } catch (error) {
      console.error("Error creating conversation:", error)
      alert("Unable to start conversation. Please try again.")
    }
  }

  const connectWithUser = async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("matches").insert({
        user1_id: user.id,
        user2_id: userId,
        status: "pending",
      })

      if (error) throw error

      alert(`Connection request sent to ${profile.full_name || profile.username}!`)
    } catch (error) {
      console.error("Error sending connection request:", error)
      alert("Unable to send connection request. Please try again.")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">This profile doesn't exist or was deleted.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.full_name || profile.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                        {(profile.full_name || profile.username || "U").charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className="flex-1">
                  <CardTitle className="text-2xl">{profile.full_name || profile.username}</CardTitle>
                  <p className="text-slate-500 dark:text-slate-400">@{profile.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.gender && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {profile.gender}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <Button
                    onClick={startConversation}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button onClick={connectWithUser} variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs defaultValue="about">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="pt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Bio</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {profile.bio || "No bio available"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Location</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {profile.location || "Location not specified"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mental-health" className="pt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Mental Health Journey</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {profile.mental_health_journey || "Mental health journey information not available"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Mental Health Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                          <Heart className="h-3 w-3 mr-1" />
                          Mental Health Support
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
