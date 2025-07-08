"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Heart, X, MessageCircle, UserX, MapPin, Calendar, RefreshCw } from "lucide-react"

interface Match {
  id: string
  other_user: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    bio?: string
    mental_health_badges?: string[]
    age?: number
    location?: string
  }
  match_score: number
  status: "pending" | "accepted" | "rejected"
  created_at: string
}

interface PotentialMatch {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  mental_health_badges?: string[]
  age?: number
  location?: string
  match_score: number
}

export default function MatchingPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("discover")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Demo data for matches
        const demoMatches: Match[] = [
          {
            id: "match-1",
            other_user: {
              id: "demo-user-1",
              username: "sarah_j",
              full_name: "Sarah Johnson",
              avatar_url: "/placeholder.svg?height=100&width=100",
              bio: "Love hiking and coffee ☕ Always here to listen and support others on their mental health journey.",
              mental_health_badges: ["Anxiety Warrior", "Mental Health Advocate"],
              age: 28,
              location: "San Francisco, CA",
            },
            match_score: 0.85,
            status: "accepted",
            created_at: new Date().toISOString(),
          },
          {
            id: "match-2",
            other_user: {
              id: "demo-user-2",
              username: "mike_chen",
              full_name: "Mike Chen",
              avatar_url: "/placeholder.svg?height=100&width=100",
              bio: "Photographer and traveler 📸 Passionate about mindfulness and helping others find peace.",
              mental_health_badges: ["Depression Fighter", "Mindfulness Practitioner"],
              age: 32,
              location: "Los Angeles, CA",
            },
            match_score: 0.78,
            status: "accepted",
            created_at: new Date().toISOString(),
          },
        ]

        // Demo data for potential matches
        const demoPotential: PotentialMatch[] = [
          {
            id: "potential-1",
            username: "alex_rivera",
            full_name: "Alex Rivera",
            avatar_url: "/placeholder.svg?height=100&width=100",
            bio: "Artist and mental health advocate 🎨 Creating art to express emotions and heal.",
            mental_health_badges: ["Bipolar Warrior", "Art Therapy"],
            age: 25,
            location: "New York, NY",
            match_score: 0.92,
          },
          {
            id: "potential-2",
            username: "emma_davis",
            full_name: "Emma Davis",
            avatar_url: "/placeholder.svg?height=100&width=100",
            bio: "Yoga instructor and wellness coach 🧘‍♀️ Helping others find balance and inner peace.",
            mental_health_badges: ["Anxiety Warrior", "Yoga Practitioner"],
            age: 30,
            location: "Austin, TX",
            match_score: 0.88,
          },
          {
            id: "potential-3",
            username: "jordan_kim",
            full_name: "Jordan Kim",
            avatar_url: "/placeholder.svg?height=100&width=100",
            bio: "Software developer and mental health advocate 💻 Building apps to help people connect.",
            mental_health_badges: ["ADHD Navigator", "Tech for Good"],
            age: 27,
            location: "Seattle, WA",
            match_score: 0.81,
          },
        ]

        setMatches(demoMatches)
        setPotentialMatches(demoPotential)
      } catch (error) {
        console.error("Error fetching matching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleAcceptMatch = async (potentialMatchId: string) => {
    const acceptedUser = potentialMatches.find((p) => p.id === potentialMatchId)
    if (acceptedUser) {
      setPotentialMatches((prev) => prev.filter((p) => p.id !== potentialMatchId))
      setMatches((prev) => [
        ...prev,
        {
          id: `match-${Date.now()}`,
          other_user: acceptedUser,
          match_score: acceptedUser.match_score,
          status: "accepted",
          created_at: new Date().toISOString(),
        },
      ])
    }
  }

  const handleRejectMatch = async (potentialMatchId: string) => {
    setPotentialMatches((prev) => prev.filter((p) => p.id !== potentialMatchId))
  }

  const handleUnmatch = async (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId))
  }

  const handleStartConversation = (otherUserId: string) => {
    window.location.href = `/messages/match-${otherUserId}`
  }

  const handleGenerateMatches = () => {
    // Simulate generating new matches
    const newMatches: PotentialMatch[] = [
      {
        id: `potential-${Date.now()}`,
        username: "new_user",
        full_name: "New User",
        bio: "Just joined the platform! Looking forward to connecting with like-minded people.",
        mental_health_badges: ["Mental Health Advocate"],
        age: 26,
        location: "Portland, OR",
        match_score: 0.75,
      },
    ]

    setPotentialMatches((prev) => [...prev, ...newMatches])
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="bg-rose-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to find matches.</p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Find Your Match
                </CardTitle>
                <Button
                  onClick={handleGenerateMatches}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Find New Matches
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="matches">
                My Matches {matches.length > 0 && <Badge className="ml-2">{matches.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Discover Tab */}
            <TabsContent value="discover">
              <Card>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
                      <p className="text-slate-600">Finding potential matches...</p>
                    </div>
                  ) : potentialMatches.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium text-slate-600 mb-2">No more potential matches</h3>
                      <p className="text-sm text-slate-500 mb-4">Check back later for new people to connect with!</p>
                      <Button
                        onClick={() => setActiveTab("matches")}
                        className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                      >
                        View My Matches
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {potentialMatches.map((match) => (
                        <Card key={match.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="aspect-square bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                              <Avatar className="h-24 w-24">
                                {match.avatar_url ? (
                                  <AvatarImage src={match.avatar_url || "/placeholder.svg"} alt={match.full_name} />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-2xl">
                                    {match.full_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{match.full_name}</h3>
                                <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                                  {Math.round(match.match_score * 100)}% match
                                </Badge>
                              </div>

                              <p className="text-sm text-slate-500 mb-2">@{match.username}</p>

                              {match.age && match.location && (
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {match.age}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {match.location}
                                  </div>
                                </div>
                              )}

                              {match.bio && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{match.bio}</p>}

                              {match.mental_health_badges && match.mental_health_badges.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {match.mental_health_badges.slice(0, 2).map((badge) => (
                                    <Badge key={badge} variant="secondary" className="text-xs">
                                      {badge}
                                    </Badge>
                                  ))}
                                  {match.mental_health_badges.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{match.mental_health_badges.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectMatch(match.id)}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Pass
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptMatch(match.id)}
                                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                                >
                                  <Heart className="h-4 w-4 mr-1" />
                                  Like
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches">
              <Card>
                <CardContent className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading your matches...</p>
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium text-slate-600 mb-2">No matches yet</h3>
                      <p className="text-sm text-slate-500 mb-4">Start discovering people to find your matches!</p>
                      <Button
                        onClick={() => setActiveTab("discover")}
                        className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                      >
                        Discover People
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {matches.map((match) => (
                        <Card key={match.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="aspect-square bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
                              <Avatar className="h-24 w-24">
                                {match.other_user.avatar_url ? (
                                  <AvatarImage
                                    src={match.other_user.avatar_url || "/placeholder.svg"}
                                    alt={match.other_user.full_name}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-2xl">
                                    {match.other_user.full_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{match.other_user.full_name}</h3>
                                <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                                  {Math.round(match.match_score * 100)}% match
                                </Badge>
                              </div>

                              <p className="text-sm text-slate-500 mb-2">@{match.other_user.username}</p>

                              {match.other_user.age && match.other_user.location && (
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {match.other_user.age}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {match.other_user.location}
                                  </div>
                                </div>
                              )}

                              {match.other_user.bio && (
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{match.other_user.bio}</p>
                              )}

                              {match.other_user.mental_health_badges &&
                                match.other_user.mental_health_badges.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {match.other_user.mental_health_badges.slice(0, 2).map((badge) => (
                                      <Badge key={badge} variant="secondary" className="text-xs">
                                        {badge}
                                      </Badge>
                                    ))}
                                    {match.other_user.mental_health_badges.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{match.other_user.mental_health_badges.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleStartConversation(match.other_user.id)}
                                  className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Message
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Unmatch with {match.other_user.full_name}?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will remove them from your matches and delete your conversation history.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleUnmatch(match.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Unmatch
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
