"use server"

import { createClient } from "@/lib/supabase/server"

export async function generateMatches() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    // Get the user's preferences
    const { data: userPrefs, error: prefsError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("profile_id", user.id)
      .single()

    if (prefsError) {
      return { error: "User preferences not found" }
    }

    // Get the user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return { error: "User profile not found" }
    }

    // Get potential matches (other users)
    const { data: potentialMatches, error: matchesError } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)

    if (matchesError) {
      return { error: "Error fetching potential matches" }
    }

    // Get existing matches to avoid duplicates
    const { data: existingMatches, error: existingError } = await supabase
      .from("matches")
      .select("profile_id_1, profile_id_2")
      .or(`profile_id_1.eq.${user.id},profile_id_2.eq.${user.id}`)

    if (existingError) {
      return { error: "Error fetching existing matches" }
    }

    // Create a set of users who are already matched
    const alreadyMatchedIds = new Set<string>()

    existingMatches?.forEach((match) => {
      if (match.profile_id_1 === user.id) {
        alreadyMatchedIds.add(match.profile_id_2)
      } else {
        alreadyMatchedIds.add(match.profile_id_1)
      }
    })

    // Filter out already matched users
    const filteredMatches = potentialMatches?.filter((profile) => !alreadyMatchedIds.has(profile.id)) || []

    // Calculate match scores
    const matchesWithScores = filteredMatches.map((profile) => {
      let score = 0.5 // Base score

      // Check for badge matches
      if (userPrefs.preferred_badges && profile.mental_health_badges) {
        const badgeMatches = userPrefs.preferred_badges.filter((badge) =>
          profile.mental_health_badges?.includes(badge),
        ).length

        if (badgeMatches > 0) {
          score += 0.1 * Math.min(badgeMatches / userPrefs.preferred_badges.length, 1)
        }
      }

      // Check for shared badges
      if (userProfile.mental_health_badges && profile.mental_health_badges) {
        const sharedBadges = userProfile.mental_health_badges.filter((badge) =>
          profile.mental_health_badges?.includes(badge),
        ).length

        if (sharedBadges > 0) {
          score += 0.2 * Math.min(sharedBadges / userProfile.mental_health_badges.length, 1)
        }
      }

      // Randomize a bit to avoid identical scores
      score += Math.random() * 0.1

      // Cap at 0.95 to avoid perfect scores
      score = Math.min(score, 0.95)

      return {
        profile,
        score,
      }
    })

    // Sort by score and take top 5
    const topMatches = matchesWithScores.sort((a, b) => b.score - a.score).slice(0, 5)

    // Insert matches into the database
    for (const match of topMatches) {
      await supabase.from("matches").insert({
        profile_id_1: user.id,
        profile_id_2: match.profile.id,
        match_score: match.score,
        status: "pending", // The other user needs to accept
      })
    }

    return { success: true, matchesGenerated: topMatches.length }
  } catch (error) {
    console.error("Error generating matches:", error)
    return { error: "Failed to generate matches" }
  }
}
