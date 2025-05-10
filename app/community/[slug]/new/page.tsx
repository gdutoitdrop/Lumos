import { NewThreadForm } from "@/components/forum/new-thread-form"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function NewThreadPage({
  params,
}: {
  params: { slug: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Check if category exists
  const { data: category, error } = await supabase
    .from("forum_categories")
    .select("name")
    .eq("slug", params.slug)
    .single()

  if (error || !category) {
    redirect("/community")
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/community/${params.slug}`}
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to {category.name}
        </Link>
        <h1 className="text-3xl font-bold">Create New Thread</h1>
        <p className="text-muted-foreground">Start a new discussion in {category.name}</p>
      </div>

      <NewThreadForm category={params.slug} />
    </div>
  )
}
