"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createThread({
  title,
  content,
  categorySlug,
}: {
  title: string
  content: string
  categorySlug: string
}) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "You must be logged in to create a thread" }
    }

    // Get the category ID from the slug
    const { data: category, error: categoryError } = await supabase
      .from("forum_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      return { success: false, error: "Category not found" }
    }

    // Create the thread
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .insert({
        title,
        content,
        category_id: category.id,
        profile_id: user.id,
      })
      .select("id")
      .single()

    if (threadError) {
      console.error("Error creating thread:", threadError)
      return { success: false, error: "Failed to create thread" }
    }

    // Revalidate the category page to show the new thread
    revalidatePath(`/community/${categorySlug}`)

    return { success: true, threadId: thread.id, categorySlug }
  } catch (error) {
    console.error("Error in createThread:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createReply({
  threadId,
  content,
}: {
  threadId: string
  content: string
}) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "You must be logged in to reply" }
    }

    // Get the thread to find its category
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .select("category_id, forum_categories(slug)")
      .eq("id", threadId)
      .single()

    if (threadError || !thread) {
      return { success: false, error: "Thread not found" }
    }

    // Create the reply
    const { error: replyError } = await supabase.from("forum_replies").insert({
      thread_id: threadId,
      content,
      profile_id: user.id,
    })

    if (replyError) {
      console.error("Error creating reply:", replyError)
      return { success: false, error: "Failed to create reply" }
    }

    // Revalidate the thread page to show the new reply
    const categorySlug = thread.forum_categories?.slug
    revalidatePath(`/community/${categorySlug}/${threadId}`)

    return { success: true }
  } catch (error) {
    console.error("Error in createReply:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function likeReply({ replyId }: { replyId: string }) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "You must be logged in to like a reply" }
    }

    // Check if the user has already liked this reply
    const { data: existingLike, error: likeCheckError } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("reply_id", replyId)
      .eq("profile_id", user.id)
      .single()

    if (likeCheckError && likeCheckError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking like:", likeCheckError)
      return { success: false, error: "Failed to check like status" }
    }

    if (existingLike) {
      // User has already liked this reply, so unlike it
      const { error: unlikeError } = await supabase.from("forum_likes").delete().eq("id", existingLike.id)

      if (unlikeError) {
        console.error("Error unliking reply:", unlikeError)
        return { success: false, error: "Failed to unlike reply" }
      }

      return { success: true, action: "unliked" }
    } else {
      // User hasn't liked this reply yet, so like it
      const { error: likeError } = await supabase.from("forum_likes").insert({
        reply_id: replyId,
        profile_id: user.id,
      })

      if (likeError) {
        console.error("Error liking reply:", likeError)
        return { success: false, error: "Failed to like reply" }
      }

      return { success: true, action: "liked" }
    }
  } catch (error) {
    console.error("Error in likeReply:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
