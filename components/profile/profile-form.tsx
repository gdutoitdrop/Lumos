"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  gender?: string
}

const mentalHealthBadgeOptions = [
  "Anxiety Warrior",
  "Depression Fighter",
  "ADHD Navigator",
  "Bipolar Warrior",
  "OCD Challenger",
  "PTSD Survivor",
  "Eating Disorder Recovery",
  "Addiction Recovery",
  "Mental Health Advocate",
  "Neurodivergent",
  "Autism Spectrum",
  "BPD Journey",
  "Grief Support",
  "Trauma Informed",
  "Therapy Believer",
  "Mindfulness Practitioner",
]

const moodOptions = [
  "Feeling great today",
  "Feeling balanced",
  "Slightly anxious",
  "Feeling down",
  "Overwhelmed",
  "Hopeful",
  "Tired but okay",
  "Energetic",
  "Need support",
  "Peaceful",
]

const genderOptions = [
  "Male",
  "Female",
  "Non-binary",
  "Transgender",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Prefer not to say",
  "Other",
]

export function ProfileForm() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Partial<Profile>>({
    username: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    mental_health_badges: [],
    current_mood: "",
    looking_for: "",
    mental_health_journey: "",
    gender: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState("")
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return
      }

      setProfile(data || {})
    }

    fetchProfile()
  }, [user, supabase])

  useEffect(() => {
    // Calculate profile completion percentage
    if (!profile) return

    const fields = [
      "username",
      "full_name",
      "avatar_url",
      "bio",
      "mental_health_badges",
      "current_mood",
      "looking_for",
      "mental_health_journey",
      "gender",
    ]

    const completedFields = fields.filter((field) => {
      const value = profile[field as keyof typeof profile]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value && String(value).trim() !== ""
    }).length

    const percentage = Math.round((completedFields / fields.length) * 100)
    setCompletionPercentage(percentage)
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          mental_health_badges: profile.mental_health_badges,
          current_mood: profile.current_mood,
          looking_for: profile.looking_for,
          mental_health_journey: profile.mental_health_journey,
          gender: profile.gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addBadge = () => {
    if (!selectedBadge || profile.mental_health_badges?.includes(selectedBadge)) return

    setProfile({
      ...profile,
      mental_health_badges: [...(profile.mental_health_badges || []), selectedBadge],
    })

    setSelectedBadge("")
  }

  const removeBadge = (badge: string) => {
    setProfile({
      ...profile,
      mental_health_badges: profile.mental_health_badges?.filter((b) => b !== badge),
    })
  }

  const handleAvatarUploadComplete = (url: string) => {
    setProfile({
      ...profile,
      avatar_url: url,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>Complete your profile to help others connect with you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information to help others connect with you</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              {user && (
                <AvatarUpload
                  userId={user.id}
                  avatarUrl={profile.avatar_url || null}
                  username={profile.username || undefined}
                  onUploadComplete={handleAvatarUploadComplete}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username || ""}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={profile.gender || ""}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select your gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentalHealthBadges">Mental Health Badges</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.mental_health_badges?.map((badge) => (
                  <Badge
                    key={badge}
                    className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 flex items-center gap-1"
                  >
                    {badge}
                    <button
                      type="button"
                      onClick={() => removeBadge(badge)}
                      className="ml-1 rounded-full hover:bg-rose-200 dark:hover:bg-rose-800 p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {badge}</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  id="mentalHealthBadges"
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a badge</option>
                  {mentalHealthBadgeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={addBadge} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentMood">Current Mood</Label>
              <select
                id="currentMood"
                value={profile.current_mood || ""}
                onChange={(e) => setProfile({ ...profile, current_mood: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select your current mood</option>
                {moodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lookingFor">Looking For</Label>
              <Textarea
                id="lookingFor"
                value={profile.looking_for || ""}
                onChange={(e) => setProfile({ ...profile, looking_for: e.target.value })}
                placeholder="What kind of connections are you looking for?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentalHealthJourney">Mental Health Journey</Label>
              <Textarea
                id="mentalHealthJourney"
                value={profile.mental_health_journey || ""}
                onChange={(e) => setProfile({ ...profile, mental_health_journey: e.target.value })}
                placeholder="Share your mental health journey if you're comfortable..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
