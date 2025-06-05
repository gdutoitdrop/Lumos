import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Server-side clients are created per request, so no singleton needed
export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}
