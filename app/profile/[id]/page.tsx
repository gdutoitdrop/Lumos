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

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Demo profile data
  const demoProfiles = {
    sarah: {
      id: "sarah",
      name: "Sarah Chen",
      username: "sarah_mindful",
      bio: "Meditation enthusiast finding peace through mindfulness. I've been on my mental health journey for 3 years and love sharing what I've learned. Nature therapy and hiking are my go-to activities for staying grounded.",
      location: "San Francisco, CA",
      age: 28,
      journey: "Anxiety & Self-Care",
      mentalHealthBadges: ["Anxiety", "Meditation", "Self-Care", "Nature Therapy"],
      mentalHealthJourney:
        "Started my journey with anxiety in college. Discovered meditation through a campus wellness program and it changed my life. Now I practice daily and help others find their calm.",
      interests: ["Hiking", "Meditation", "Photography", "Yoga"],
      lookingFor: "Supportive connections and meditation buddies",
      isOnline: true,
      joinedDate: "January 2024",
    },
    alex: {
      id: "alex",
      name: "Alex Rivera",
      username: "alex_journey",
      bio: "Artist using creativity to heal and express emotions. Art therapy has been transformative in my depression recovery. I believe in the power of creative expression to process difficult feelings.",
      location: "Austin, TX",
      age: 32,
      journey: "Depression Recovery",
      mentalHealthBadges: ["Depression", "Art Therapy", "Creative Expression", "Support Groups"],
      mentalHealthJourney:
        "Struggled with depression for years before finding art therapy. Creating art helps me process emotions and connect with others who understand the journey.",
      interests: ["Painting", "Music", "Writing", "Photography"],
      lookingFor: "Creative souls and supportive friends",
      isOnline: false,
      joinedDate: "March 2024",
    },
    emma: {
      id: "emma",
      name: "Emma Thompson",
      username: "emma_wellness",
      bio: "Yoga instructor and ADHD advocate helping others find focus and calm. I combine movement with mindfulness to create accessible wellness practices for neurodivergent minds.",
      location: "Portland, OR",
      age: 26,
      journey: "ADHD & Mindfulness",
      mentalHealthBadges: ["ADHD", "Yoga", "Mindfulness", "Body Positivity"],
      mentalHealthJourney:
        "Diagnosed with ADHD in my early twenties. Yoga and mindfulness practices have helped me embrace my neurodivergent brain and find focus in movement.",
      interests: ["Yoga", "Dance", "Cooking", "Gardening"],
      lookingFor: "Fellow neurodivergent friends and yoga enthusiasts",
      isOnline: true,
      joinedDate: "February 2024",
    },
  }

  useEffect(() => {
    const profileData = demoProfiles[userId as keyof typeof demoProfiles]
    if (profileData) {
      setProfile(profileData)
    }
    setLoading(false)
  }, [userId])

  const startConversation = () => {
    router.push(`/messages/chat/${userId}`)
  }

  const connectWithUser = () => {
    // Demo connection action
    alert(`Connection request sent to ${profile.name}!`)
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
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.isOnline && (
                    <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <p className="text-slate-500 dark:text-slate-400">@{profile.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {profile.age} years old
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {profile.journey}
                  </Badge>
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
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Looking For</h3>
                      <p className="text-slate-600 dark:text-slate-300">{profile.lookingFor}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest: string) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Member Since</h3>
                      <p className="text-slate-600 dark:text-slate-300">{profile.joinedDate}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mental-health" className="pt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Mental Health Journey</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {profile.mentalHealthJourney}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Mental Health Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.mentalHealthBadges.map((badge: string) => (
                          <Badge
                            key={badge}
                            className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
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
