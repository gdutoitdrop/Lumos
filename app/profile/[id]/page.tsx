"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, MessageCircle, Heart, UserX, MapPin, Calendar, User, Settings } from "lucide-react"

interface Profile {
  id: string
  username: string
  full_name: string
  bio?: string
  avatar_url?: string
  mental_health_badges?: string[]
  current_mood?: string
  looking_for?: string
  mental_health_journey?: string
  gender?: string
  age?: number
  location?: string
  created_at: string
}

export default function ProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const supabase = createClient()

  const profileId = params?.id as string

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setIsOwnProfile(user?.id === profileId)

      try {
        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", profileId).single()

        if (error) {
          console.error("Error fetching profile:", error)
          setProfile(getDemoProfile(profileId))
        } else {
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error)
        setProfile(getDemoProfile(profileId))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId, user])

  const getDemoProfile = (id: string): Profile => ({
    id,
    username: "demo_user",
    full_name: "Demo User",
    bio: "This is a demo profile. In a real app, this would show the actual user's information.",
    avatar_url: undefined,
    mental_health_badges: ["Demo Badge", "Test User"],
    current_mood: "Optimistic",
    looking_for: "Friendship and support",
    mental_health_journey: "Learning to manage anxiety and building healthy habits.",
    gender: "Other",
    age: 25,
    location: "Demo City",
    created_at: new Date().toISOString(),
  })

  const handleStartConversation = () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    window.location.href = `/messages/match-${profileId}`
  }

  const handleSendMatch = () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    // In a real app, this would send a match request
    console.log("Sending match request to:", profileId)
  }

  const handleUnmatch = () => {
    if (!user) return
    // In a real app, this would unmatch the user
    console.log("Unmatching with:", profileId)
    window.location.href = "/matching"
  }

  const formatJoinDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "long",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
            <p className="text-slate-600 mb-4">The profile you're looking for doesn't exist.</p>
            <Button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                {isOwnProfile && (
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/settings")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="h-32 w-32 mb-4">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-4xl">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {!isOwnProfile && user && (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={handleStartConversation}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" onClick={handleSendMatch}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unmatch with {profile.full_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove them from your matches and delete your conversation history. This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUnmatch} className="bg-red-600 hover:bg-red-700">
                              Unmatch
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">{profile.full_name}</h1>
                    <p className="text-slate-500">@{profile.username}</p>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {profile.age && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{profile.age} years old</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.gender && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4" />
                        <span>{profile.gender}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatJoinDate(profile.created_at)}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-800 mb-2">About</h3>
                      <p className="text-slate-600">{profile.bio}</p>
                    </div>
                  )}

                  {/* Mental Health Badges */}
                  {profile.mental_health_badges && profile.mental_health_badges.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-800 mb-2">Mental Health Journey</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.mental_health_badges.map((badge) => (
                          <Badge key={badge} className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.current_mood && (
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-700 mb-1">Current Mood</h4>
                    <p className="text-slate-600">{profile.current_mood}</p>
                  </div>
                )}
                {profile.looking_for && (
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-700 mb-1">Looking For</h4>
                    <p className="text-slate-600">{profile.looking_for}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mental Health Journey */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mental Health Journey</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.mental_health_journey ? (
                  <p className="text-slate-600">{profile.mental_health_journey}</p>
                ) : (
                  <p className="text-slate-500 italic">No journey details shared yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
