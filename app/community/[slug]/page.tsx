import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Plus } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the category
  const { data: category, error: categoryError } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (categoryError || !category) {
    redirect("/community")
  }

  // Get threads for this category
  const { data: threads, error: threadsError } = await supabase
    .from("forum_threads")
    .select(`
      id,
      title,
      created_at,
      profile_id,
      profiles (
        username,
        avatar_url
      ),
      forum_replies (count)
    `)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })

  if (threadsError) {
    console.error("Error fetching threads:", threadsError)
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/community" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
            ← Back to Categories
          </Link>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
        <Button asChild>
          <Link href={`/community/${params.slug}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Thread
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {threads && threads.length > 0 ? (
          threads.map((thread) => (
            <Link key={thread.id} href={`/community/${params.slug}/${thread.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-xl">{thread.title}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <CardDescription>Posted by {thread.profiles?.username || "Anonymous"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {thread.forum_replies?.count || 0} replies
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No threads yet</CardTitle>
              <CardDescription>Be the first to start a discussion in this category!</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
