import { createClient } from "@/lib/supabase/client"
import { messagingService } from "@/lib/messaging-service"
import { matchService } from "@/lib/match-service"

export interface HealthCheckResult {
  component: string
  status: "healthy" | "warning" | "error"
  message: string
  details?: any
}

class SystemHealthChecker {
  private supabase = createClient()

  async runFullHealthCheck(userId?: string): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = []

    // Test database connection
    results.push(await this.testDatabaseConnection())

    // Test authentication
    results.push(await this.testAuthentication())

    // Test profiles table
    results.push(await this.testProfilesTable())

    // Test messaging system
    results.push(await this.testMessagingSystem(userId))

    // Test matching system
    results.push(await this.testMatchingSystem(userId))

    // Test forum system
    results.push(await this.testForumSystem())

    // Test file uploads
    results.push(await this.testFileUploads())

    return results
  }

  private async testDatabaseConnection(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("count").limit(1)

      if (error) {
        return {
          component: "Database Connection",
          status: "error",
          message: "Failed to connect to database",
          details: error,
        }
      }

      return {
        component: "Database Connection",
        status: "healthy",
        message: "Database connection successful",
      }
    } catch (error) {
      return {
        component: "Database Connection",
        status: "error",
        message: "Database connection failed",
        details: error,
      }
    }
  }

  private async testAuthentication(): Promise<HealthCheckResult> {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        return {
          component: "Authentication",
          status: "warning",
          message: "Auth session check failed",
          details: error,
        }
      }

      return {
        component: "Authentication",
        status: session ? "healthy" : "warning",
        message: session ? "User authenticated" : "No active session",
      }
    } catch (error) {
      return {
        component: "Authentication",
        status: "error",
        message: "Authentication system error",
        details: error,
      }
    }
  }

  private async testProfilesTable(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("id, username, full_name").limit(5)

      if (error) {
        return {
          component: "Profiles Table",
          status: "error",
          message: "Failed to query profiles table",
          details: error,
        }
      }

      return {
        component: "Profiles Table",
        status: "healthy",
        message: `Profiles table accessible (${data?.length || 0} profiles found)`,
      }
    } catch (error) {
      return {
        component: "Profiles Table",
        status: "error",
        message: "Profiles table error",
        details: error,
      }
    }
  }

  private async testMessagingSystem(userId?: string): Promise<HealthCheckResult> {
    try {
      if (!userId) {
        return {
          component: "Messaging System",
          status: "warning",
          message: "Cannot test messaging without user ID",
        }
      }

      // Test getting conversations
      const conversations = await messagingService.getUserConversations(userId)

      // Test getting messages for a demo conversation
      const messages = await messagingService.getConversationMessages("demo-conv-1")

      return {
        component: "Messaging System",
        status: "healthy",
        message: `Messaging system functional (${conversations.length} conversations, ${messages.length} demo messages)`,
      }
    } catch (error) {
      return {
        component: "Messaging System",
        status: "error",
        message: "Messaging system error",
        details: error,
      }
    }
  }

  private async testMatchingSystem(userId?: string): Promise<HealthCheckResult> {
    try {
      if (!userId) {
        return {
          component: "Matching System",
          status: "warning",
          message: "Cannot test matching without user ID",
        }
      }

      // Test getting matches
      const matches = await matchService.getUserMatches(userId)

      // Test getting potential matches
      const potentialMatches = await matchService.getPotentialMatches(userId)

      return {
        component: "Matching System",
        status: "healthy",
        message: `Matching system functional (${matches.length} matches, ${potentialMatches.length} potential matches)`,
      }
    } catch (error) {
      return {
        component: "Matching System",
        status: "error",
        message: "Matching system error",
        details: error,
      }
    }
  }

  private async testForumSystem(): Promise<HealthCheckResult> {
    try {
      const { data, error } = await this.supabase.from("forum_threads").select("id, title, category").limit(5)

      if (error) {
        return {
          component: "Forum System",
          status: "error",
          message: "Failed to query forum threads",
          details: error,
        }
      }

      return {
        component: "Forum System",
        status: "healthy",
        message: `Forum system accessible (${data?.length || 0} threads found)`,
      }
    } catch (error) {
      return {
        component: "Forum System",
        status: "error",
        message: "Forum system error",
        details: error,
      }
    }
  }

  private async testFileUploads(): Promise<HealthCheckResult> {
    try {
      // Test if storage bucket exists
      const { data, error } = await this.supabase.storage.listBuckets()

      if (error) {
        return {
          component: "File Uploads",
          status: "warning",
          message: "Storage system not accessible",
          details: error,
        }
      }

      const avatarBucket = data?.find((bucket) => bucket.name === "avatars")

      return {
        component: "File Uploads",
        status: avatarBucket ? "healthy" : "warning",
        message: avatarBucket ? "Storage system accessible" : "Avatar bucket not found",
      }
    } catch (error) {
      return {
        component: "File Uploads",
        status: "error",
        message: "File upload system error",
        details: error,
      }
    }
  }

  async testSpecificFeature(feature: string, userId?: string): Promise<HealthCheckResult> {
    switch (feature) {
      case "messaging":
        return this.testMessagingSystem(userId)
      case "matching":
        return this.testMatchingSystem(userId)
      case "forum":
        return this.testForumSystem()
      case "auth":
        return this.testAuthentication()
      case "database":
        return this.testDatabaseConnection()
      case "profiles":
        return this.testProfilesTable()
      case "uploads":
        return this.testFileUploads()
      default:
        return {
          component: feature,
          status: "error",
          message: "Unknown feature",
        }
    }
  }
}

export const systemHealthChecker = new SystemHealthChecker()
