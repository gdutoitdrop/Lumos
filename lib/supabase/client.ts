import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createClientComponentClient<Database>()
  return supabaseClient
}

export const supabase = createClient()
