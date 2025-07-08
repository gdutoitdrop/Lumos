import { createClient } from "@/lib/supabase/client"

export interface Match {
  id: string
  profile_id_1: string
  profile_id_2: string
  match_score: number
  status: "pending" | "accepted" | "rejected" | "unmatched"
  created_at: string
  updated_at: string
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
}

export interface PotentialMatch {
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

class MatchService {
  private supabase = createClient()

  async getUserMatches(userId: string): Promise<Match[]> {
    try {
      const { data: matches, error } = await this.supabase
        .from("matches")
        .select("*")
        .or(`profile_id_1.eq.${userId},profile_id_2.eq.${userId}`)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching matches:", error)
        return this.getDemoMatches()
      }

      if (!matches || matches.length === 0) {
        return this.getDemoMatches()
      }

      // Get other user profiles for each match
      const matchesWithProfiles = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.profile_id_1 === userId ? match.profile_id_2 : match.profile_id_1

          const { data: otherUser, error: profileError } = await this.supabase
            .from("profiles")
            .select("*")
            .eq("id", otherUserId)
            .single()

          if (profileError || !otherUser) {
            return null
          }

          return {
            ...match,
            other_user: otherUser,
          }
        }),
      )

      return matchesWithProfiles.filter((match) => match !== null) as Match[]
    } catch (error) {
      console.error("Error in getUserMatches:", error)
      return this.getDemoMatches()
    }
  }

  private getDemoMatches(): Match[] {
    return [
      {
        id: "demo-match-1",
        profile_id_1: "current-user",
        profile_id_2: "demo-user-1",
        match_score: 0.85,
        status: "accepted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: "demo-user-1",
          username: "sarah_j",
          full_name: "Sarah Johnson",
          avatar_url: undefined,
          bio: "Love hiking and coffee ☕ Always here to listen and support others on their mental health journey.",
          mental_health_badges: ["Anxiety Warrior", "Mental Health Advocate"],
          age: 28,
          location: "San Francisco, CA",
        },
      },
      {
        id: "demo-match-2",
        profile_id_1: "current-user",
        profile_id_2: "demo-user-2",
        match_score: 0.75,
        status: "accepted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: "demo-user-2",
          username: "mike_chen",
          full_name: "Mike Chen",
          avatar_url: undefined,
          bio: "Photographer and traveler 📸 Passionate about mindfulness and helping others find peace.",
          mental_health_badges: ["Depression Fighter", "Mindfulness Practitioner"],
          age: 32,
          location: "Los Angeles, CA",
        },
      },
    ]
  }

  async getPotentialMatches(userId: string): Promise<PotentialMatch[]> {
    try {
      // Get users that aren't already matched or rejected
      const { data: existingMatches } = await this.supabase
        .from("matches")
        .select("profile_id_1, profile_id_2")
        .or(`profile_id_1.eq.${userId},profile_id_2.eq.${userId}`)

      const excludedUserIds = new Set([userId])
      existingMatches?.forEach((match) => {
        excludedUserIds.add(match.profile_id_1 === userId ? match.profile_id_2 : match.profile_id_1)
      })

      const { data: potentialMatches, error } = await this.supabase
        .from("profiles")
        .select("*")
        .not("id", "in", `(${Array.from(excludedUserIds).join(",")})`)
        .limit(10)

      if (error) {
        console.error("Error fetching potential matches:", error)
        return this.getDemoPotentialMatches()
      }

      return (potentialMatches || []).map((profile) => ({
        ...profile,
        match_score: Math.random() * 0.4 + 0.6, // Random score between 0.6-1.0
      }))
    } catch (error) {
      console.error("Error in getPotentialMatches:", error)
      return this.getDemoPotentialMatches()
    }
  }

  private getDemoPotentialMatches(): PotentialMatch[] {
    return [
      {
        id: "demo-potential-1",
        username: "alex_rivera",
        full_name: "Alex Rivera",
        avatar_url: undefined,
        bio: "Artist and mental health advocate 🎨 Creating art to express emotions and heal.",
        mental_health_badges: ["Bipolar Warrior", "Art Therapy"],
        age: 25,
        location: "New York, NY",
        match_score: 0.92,
      },
      {
        id: "demo-potential-2",
        username: "emma_davis",
        full_name: "Emma Davis",
        avatar_url: undefined,
        bio: "Yoga instructor and wellness coach 🧘‍♀️ Helping others find balance and inner peace.",
        mental_health_badges: ["Anxiety Warrior", "Yoga Practitioner"],
        age: 30,
        location: "Austin, TX",
        match_score: 0.88,
      },
    ]
  }

  async acceptMatch(userId: string, otherUserId: string): Promise<boolean> {
    try {
      // Check if match already exists
      const { data: existingMatch } = await this.supabase
        .from("matches")
        .select("*")
        .or(
          `and(profile_id_1.eq.${userId},profile_id_2.eq.${otherUserId}),and(profile_id_1.eq.${otherUserId},profile_id_2.eq.${userId})`,
        )
        .single()

      if (existingMatch) {
        // Update existing match
        const { error } = await this.supabase
          .from("matches")
          .update({
            status: "accepted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMatch.id)

        return !error
      } else {
        // Create new match
        const { error } = await this.supabase.from("matches").insert({
          profile_id_1: userId,
          profile_id_2: otherUserId,
          status: "accepted",
          match_score: Math.random() * 0.4 + 0.6,
        })

        return !error
      }
    } catch (error) {
      console.error("Error accepting match:", error)
      return false
    }
  }

  async rejectMatch(userId: string, otherUserId: string): Promise<boolean> {
    try {
      // Check if match already exists
      const { data: existingMatch } = await this.supabase
        .from("matches")
        .select("*")
        .or(
          `and(profile_id_1.eq.${userId},profile_id_2.eq.${otherUserId}),and(profile_id_1.eq.${otherUserId},profile_id_2.eq.${userId})`,
        )
        .single()

      if (existingMatch) {
        // Update existing match
        const { error } = await this.supabase
          .from("matches")
          .update({
            status: "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMatch.id)

        return !error
      } else {
        // Create new rejected match
        const { error } = await this.supabase.from("matches").insert({
          profile_id_1: userId,
          profile_id_2: otherUserId,
          status: "rejected",
          match_score: 0,
        })

        return !error
      }
    } catch (error) {
      console.error("Error rejecting match:", error)
      return false
    }
  }

  async unmatchUser(userId: string, otherUserId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("matches")
        .update({
          status: "unmatched",
          updated_at: new Date().toISOString(),
        })
        .or(
          `and(profile_id_1.eq.${userId},profile_id_2.eq.${otherUserId}),and(profile_id_1.eq.${otherUserId},profile_id_2.eq.${userId})`,
        )

      return !error
    } catch (error) {
      console.error("Error unmatching user:", error)
      return false
    }
  }
}

export const matchService = new MatchService()
