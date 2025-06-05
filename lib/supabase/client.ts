import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Singleton pattern to ensure only one client instance
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  // Return existing client if it exists
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new client only if one doesn't exist
  supabaseClient = createClientComponentClient<Database>()
  return supabaseClient
}

// Export the client directly for consistent usage
export const supabase = createClient()
