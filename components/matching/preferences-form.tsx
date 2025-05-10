"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]

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

const genderOptions = ["Male", "Female", "Non-binary", "Transgender", "Genderqueer", "Prefer not to say"]

export function PreferencesForm() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    age_min: 18,
    age_max: 65,
    connection_type: "both",
    preferred_badges: [],
    preferred_genders: [],
    location: "",
    max_distance: 50,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState("")
  const [selectedGender, setSelectedGender] = useState("")

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return

      const { data, error } = await supabase.from("user_preferences").select("*").eq("profile_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        console.error("Error fetching preferences:", error)
        return
      }

      if (data) {
        setPreferences(data)
      }
    }

    fetchPreferences()
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if preferences already exist
      const { data: existingPrefs, error: checkError } = await supabase
        .from("user_preferences")
        .select("profile_id")
        .eq("profile_id", user.id)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      let error

      if (existingPrefs) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from("user_preferences")
          .update({
            age_min: preferences.age_min,
            age_max: preferences.age_max,
            connection_type: preferences.connection_type,
            preferred_badges: preferences.preferred_badges,
            preferred_genders: preferences.preferred_genders,
            location: preferences.location,
            max_distance: preferences.max_distance,
            updated_at: new Date().toISOString(),
          })
          .eq("profile_id", user.id)

        error = updateError
      } else {
        // Insert new preferences
        const { error: insertError } = await supabase.from("user_preferences").insert({
          profile_id: user.id,
          age_min: preferences.age_min,
          age_max: preferences.age_max,
          connection_type: preferences.connection_type,
          preferred_badges: preferences.preferred_badges,
          preferred_genders: preferences.preferred_genders,
          location: preferences.location,
          max_distance: preferences.max_distance,
        })

        error = insertError
      }

      if (error) throw error

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your preferences")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addBadge = () => {
    if (!selectedBadge || preferences.preferred_badges?.includes(selectedBadge)) return

    setPreferences({
      ...preferences,
      preferred_badges: [...(preferences.preferred_badges || []), selectedBadge],
    })

    setSelectedBadge("")
  }

  const removeBadge = (badge: string) => {
    setPreferences({
      ...preferences,
      preferred_badges: preferences.preferred_badges?.filter((b) => b !== badge),
    })
  }

  const addGender = () => {
    if (!selectedGender || preferences.preferred_genders?.includes(selectedGender)) return

    setPreferences({
      ...preferences,
      preferred_genders: [...(preferences.preferred_genders || []), selectedGender],
    })

    setSelectedGender("")
  }

  const removeGender = (gender: string) => {
    setPreferences({
      ...preferences,
      preferred_genders: preferences.preferred_genders?.filter((g) => g !== gender),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Preferences</CardTitle>
        <CardDescription>Set your preferences to find better matches</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
            <AlertDescription>Preferences updated successfully!</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Connection Type</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={preferences.connection_type === "dating" ? "default" : "outline"}
                onClick={() => setPreferences({ ...preferences, connection_type: "dating" })}
                className={preferences.connection_type === "dating" ? "bg-rose-500 text-white" : ""}
              >
                Dating
              </Button>
              <Button
                type="button"
                variant={preferences.connection_type === "friendship" ? "default" : "outline"}
                onClick={() => setPreferences({ ...preferences, connection_type: "friendship" })}
                className={preferences.connection_type === "friendship" ? "bg-blue-500 text-white" : ""}
              >
                Friendship
              </Button>
              <Button
                type="button"
                variant={preferences.connection_type === "both" ? "default" : "outline"}
                onClick={() => setPreferences({ ...preferences, connection_type: "both" })}
                className={preferences.connection_type === "both" ? "bg-purple-500 text-white" : ""}
              >
                Both
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Age Range: {preferences.age_min} - {preferences.age_max}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ageMin" className="text-xs">
                  Min Age
                </Label>
                <Input
                  id="ageMin"
                  type="number"
                  min={18}
                  max={preferences.age_max}
                  value={preferences.age_min || 18}
                  onChange={(e) => setPreferences({ ...preferences, age_min: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="ageMax" className="text-xs">
                  Max Age
                </Label>
                <Input
                  id="ageMax"
                  type="number"
                  min={preferences.age_min}
                  max={100}
                  value={preferences.age_max || 65}
                  onChange={(e) => setPreferences({ ...preferences, age_max: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={preferences.location || ""}
              onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
              placeholder="City, State"
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Distance: {preferences.max_distance} miles</Label>
            <Slider
              value={[preferences.max_distance || 50]}
              min={5}
              max={500}
              step={5}
              onValueChange={(value) => setPreferences({ ...preferences, max_distance: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredBadges">Preferred Mental Health Badges</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferences.preferred_badges?.map((badge) => (
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
                id="preferredBadges"
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select badges that you'd prefer your matches to have
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredGenders">Preferred Genders</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferences.preferred_genders?.map((gender) => (
                <Badge
                  key={gender}
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 flex items-center gap-1"
                >
                  {gender}
                  <button
                    type="button"
                    onClick={() => removeGender(gender)}
                    className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {gender}</span>
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                id="preferredGenders"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a gender</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={addGender} variant="outline">
                Add
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
