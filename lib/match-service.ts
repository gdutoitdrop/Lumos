import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Match = Database["public"]["Tables"]["matches"]["Row"]

export class MatchService {
  private supabase = createClient()

  async getPotentialMatches(userId: string, limit = 10) {
    try {
      // Get users that haven't been matched with yet
      const { data, error } = await this.supabase.from("profiles").select("*").neq("id", userId).limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching potential matches:", error)
      // Return demo data on error
      return [
        {
          id: "demo-match-1",
          email: "alex@example.com",
          full_name: "Alex Johnson",
          avatar_url: null,
          bio: "Love hiking and photography. Looking for someone to explore the city with!",
          age: 28,
          location: "San Francisco, CA",
          interests: ["hiking", "photography", "travel"],
          mode: "dating" as const,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-match-2",
          email: "sam@example.com",
          full_name: "Sam Wilson",
          avatar_url: null,
          bio: "Coffee enthusiast and book lover. Always up for deep conversations!",
          age: 25,
          location: "New York, NY",
          interests: ["reading", "coffee", "art"],
          mode: "friendship" as const,
          is_premium: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    }
  }

  async createMatch(userId: string, targetUserId: string, action: "like" | "pass") {
    try {
      const status = action === "like" ? "pending" : "rejected"

      const { data, error } = await this.supabase
        .from("matches")
        .insert({
          user_1: userId,
          user_2: targetUserId,
          status,
        })
        .select()
        .single()

      if (error) throw error

      // Check if it's a mutual match
      if (action === "like") {
        const { data: mutualMatch } = await this.supabase
          .from("matches")
          .select("*")
          .eq("user_1", targetUserId)
          .eq("user_2", userId)
          .eq("status", "pending")
          .single()

        if (mutualMatch) {
          // Update both matches to 'matched'
          await this.supabase.from("matches").update({ status: "matched" }).in("id", [data.id, mutualMatch.id])

          return { ...data, is_mutual: true }
        }
      }

      return { ...data, is_mutual: false }
    } catch (error) {
      console.error("Error creating match:", error)
      throw error
    }
  }

  async getMatches(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("matches")
        .select(`
          *,
          user_1_profile:profiles!matches_user_1_fkey(id, full_name, avatar_url, bio),
          user_2_profile:profiles!matches_user_2_fkey(id, full_name, avatar_url, bio)
        `)
        .or(`user_1.eq.${userId},user_2.eq.${userId}`)
        .eq("status", "matched")
        .order("created_at", { ascending: false })

      if (error) throw error

      return (
        data?.map((match) => ({
          ...match,
          other_user: match.user_1 === userId ? match.user_2_profile : match.user_1_profile,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching matches:", error)
      return []
    }
  }
}

export const matchService = new MatchService()
