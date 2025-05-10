import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if this is an admin request
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get("adminKey")

    if (adminKey !== process.env.ADMIN_SEED_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Seed sample forum threads and replies
    const { data: categories } = await supabase.from("forum_categories").select("id, slug")

    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: "No categories found" }, { status: 404 })
    }

    // Get admin user
    const { data: adminUser } = await supabase.auth.getUser()

    if (!adminUser.user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    // Create sample threads
    const sampleThreads = [
      {
        category_id: categories.find((c) => c.slug === "anxiety-support")?.id,
        profile_id: adminUser.user.id,
        title: "Coping with social anxiety during work meetings",
        content:
          "I've been struggling with social anxiety during work meetings, especially when I need to present. Does anyone have any tips or strategies that have worked for them?",
      },
      {
        category_id: categories.find((c) => c.slug === "depression-resources")?.id,
        profile_id: adminUser.user.id,
        title: "Resources for managing seasonal depression",
        content:
          "As winter approaches, I'm starting to feel the effects of seasonal depression. I'm looking for resources or strategies that have helped others cope with this.",
      },
      {
        category_id: categories.find((c) => c.slug === "mindfulness-practices")?.id,
        profile_id: adminUser.user.id,
        title: "Beginner's guide to meditation",
        content:
          "I'm new to meditation and mindfulness. Can anyone recommend some beginner-friendly resources or practices to get started?",
      },
    ]

    // Insert threads
    for (const thread of sampleThreads) {
      if (!thread.category_id) continue

      const { data: existingThreads } = await supabase
        .from("forum_threads")
        .select("id")
        .eq("title", thread.title)
        .limit(1)

      if (existingThreads && existingThreads.length > 0) continue

      await supabase.from("forum_threads").insert(thread)
    }

    // Update category stats
    for (const category of categories) {
      const { count: threadCount } = await supabase
        .from("forum_threads")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)

      const { count: replyCount } = await supabase
        .from("forum_replies")
        .select("*", { count: "exact", head: true })
        .in("thread_id", supabase.from("forum_threads").select("id").eq("category_id", category.id))

      // Check if stats exist
      const { data: existingStats } = await supabase
        .from("forum_category_stats")
        .select("*")
        .eq("category_id", category.id)
        .single()

      if (existingStats) {
        await supabase
          .from("forum_category_stats")
          .update({
            thread_count: threadCount || 0,
            reply_count: replyCount || 0,
            last_activity: new Date().toISOString(),
          })
          .eq("category_id", category.id)
      } else {
        await supabase.from("forum_category_stats").insert({
          category_id: category.id,
          thread_count: threadCount || 0,
          reply_count: replyCount || 0,
          last_activity: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true, message: "Sample data seeded successfully" })
  } catch (error: any) {
    console.error("Error seeding data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
