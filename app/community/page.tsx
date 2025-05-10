import { ForumCategories } from "@/components/forum/forum-categories"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function CommunityPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Forums</h1>
        <p className="text-muted-foreground">
          Connect with others, share experiences, and find support in our community forums.
        </p>
      </div>

      <ForumCategories />
    </div>
  )
}
