"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { matchService } from "@/lib/match-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, X, MapPin } from "lucide-react"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  age: number | null
  location: string | null
  interests: string[] | null
  mode: "dating" | "friendship" | null
}

export default function MatchingPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfiles()
    }
  }, [user])

  const loadProfiles = async () => {
    if (!user) return

    try {
      const data = await matchService.getPotentialMatches(user.id)
      setProfiles(data)
    } catch (error) {
      console.error("Error loading profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: "like" | "pass") => {
    if (!user || currentIndex >= profiles.length) return

    const currentProfile = profiles[currentIndex]

    try {
      const result = await matchService.createMatch(user.id, currentProfile.id, action)

      if (result.is_mutual) {
        alert("It's a match! 🎉")
      }

      setCurrentIndex((prev) => prev + 1)
    } catch (error) {
      console.error("Error creating match:", error)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please sign in to start matching.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No more profiles</h3>
              <p className="text-gray-500 mb-4">Check back later for new potential matches!</p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Discover</h1>

        <Card className="overflow-hidden">
          <div className="relative">
            <div className="h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={currentProfile.avatar_url || ""} />
                <AvatarFallback className="text-2xl">{currentProfile.full_name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
            </div>
            {currentProfile.mode && (
              <Badge
                className="absolute top-4 right-4"
                variant={currentProfile.mode === "dating" ? "default" : "secondary"}
              >
                {currentProfile.mode === "dating" ? "💕 Dating" : "👥 Friendship"}
              </Badge>
            )}
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {currentProfile.full_name || "Anonymous"}
                  {currentProfile.age && <span className="text-gray-500 font-normal">, {currentProfile.age}</span>}
                </h2>
                {currentProfile.location && (
                  <div className="flex items-center text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{currentProfile.location}</span>
                  </div>
                )}
              </div>

              {currentProfile.bio && <p className="text-gray-700">{currentProfile.bio}</p>}

              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button variant="outline" size="lg" onClick={() => handleAction("pass")} className="flex-1">
                <X className="w-5 h-5 mr-2" />
                Pass
              </Button>
              <Button
                size="lg"
                onClick={() => handleAction("like")}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Heart className="w-5 h-5 mr-2" />
                Like
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-sm text-gray-500">
          {currentIndex + 1} of {profiles.length}
        </div>
      </div>
    </div>
  )
}
