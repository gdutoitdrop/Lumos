"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { messagingService, type Profile } from "@/lib/messaging-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Heart,
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Shield,
  Star,
  Coffee,
  Book,
  Music,
  Camera,
} from "lucide-react"

export default function ProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const profileId = params?.id as string

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError("Profile not found")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const profileData = await messagingService.getProfile(profileId)
        if (profileData) {
          setProfile(profileData)
        } else {
          setError("Profile not found")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [profileId])

  const handleStartConversation = () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    window.location.href = `/messages/match-${profileId}`
  }

  const handleLikeProfile = () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    // In a real app, you'd call a like API here
    console.log("Liked profile:", profileId)
  }

  const isOwnProfile = user?.id === profileId

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Loading profile...</h3>
          <p className="text-slate-500">Getting user information</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
            <p className="text-slate-600 mb-4">{error || "The profile you're looking for doesn't exist."}</p>
            <Button
              onClick={() => (window.location.href = "/matching")}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              Find Matches
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-semibold">Profile</h1>
              </div>
            </CardContent>
          </Card>

          {/* Profile Header */}
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
                      <Button variant="outline" onClick={handleLikeProfile}>
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {isOwnProfile && (
                    <Button
                      onClick={() => (window.location.href = "/profile")}
                      className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{profile.full_name}</h2>
                    <p className="text-slate-600">@{profile.username}</p>
                  </div>

                  {/* Basic Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                    {profile.age && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {profile.age} years old
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Verified
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="mb-4">
                      <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Current Mood */}
                  {profile.current_mood && (
                    <div className="mb-4">
                      <h3 className="font-medium text-slate-800 mb-2">Current Mood</h3>
                      <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                        {profile.current_mood}
                      </Badge>
                    </div>
                  )}

                  {/* Mental Health Badges */}
                  {profile.mental_health_badges && profile.mental_health_badges.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-slate-800 mb-2">Mental Health Journey</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.mental_health_badges.map((badge) => (
                          <Badge key={badge} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Looking For */}
                  {profile.looking_for && (
                    <div className="mb-4">
                      <h3 className="font-medium text-slate-800 mb-2">Looking For</h3>
                      <p className="text-slate-600">{profile.looking_for}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="about" className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="interests">Interests</TabsTrigger>
                  <TabsTrigger value="journey">Journey</TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            {/* About Tab */}
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About {profile.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.mental_health_journey && (
                    <div>
                      <h3 className="font-medium text-slate-800 mb-2">Mental Health Journey</h3>
                      <p className="text-slate-600 leading-relaxed">{profile.mental_health_journey}</p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="font-medium text-slate-800 mb-3">Profile Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium">4.8</p>
                        <p className="text-xs text-slate-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium">127</p>
                        <p className="text-xs text-slate-500">Conversations</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium">89</p>
                        <p className="text-xs text-slate-500">Matches</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-sm font-medium">100%</p>
                        <p className="text-xs text-slate-500">Verified</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests">
              <Card>
                <CardHeader>
                  <CardTitle>Interests & Hobbies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Coffee className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm font-medium">Coffee</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Book className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Reading</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Music className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-medium">Music</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Photography</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Journey Tab */}
            <TabsContent value="journey">
              <Card>
                <CardHeader>
                  <CardTitle>Mental Health Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-rose-500 pl-4">
                      <h3 className="font-medium text-slate-800">Joined Lumos</h3>
                      <p className="text-sm text-slate-600">
                        Started their journey on the platform to connect with like-minded individuals
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>

                    {profile.mental_health_badges && profile.mental_health_badges.length > 0 && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-slate-800">Achievements</h3>
                        <p className="text-sm text-slate-600">
                          Earned badges for their mental health advocacy and support
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {profile.mental_health_badges.map((badge) => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-medium text-slate-800">Community Impact</h3>
                      <p className="text-sm text-slate-600">
                        Actively participates in community discussions and supports others
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Ongoing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
