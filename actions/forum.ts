"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Create a new thread
export async function createThread(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const categorySlug = formData.get("category") as string

  if (!title || !content || !categorySlug) {
    throw new Error("Missing required fields")
  }

  try {
    // Get the category ID from the slug
    const { data: category, error: categoryError } = await supabase
      .from("forum_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      throw new Error("Category not found")
    }

    // Get the user's profile ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      throw new Error("Profile not found")
    }

    // Create the thread
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .insert({
        category_id: category.id,
        profile_id: profile.id,
        title,
        content,
      })
      .select()
      .single()

    if (threadError) {
      throw threadError
    }

    revalidatePath(`/community/${categorySlug}`)

    // Instead of redirecting, return the thread data and let the client handle the navigation
    return {
      success: true,
      threadId: thread.id,
      categorySlug,
    }
  } catch (error) {
    console.error("Error creating thread:", error)
    throw error
  }
}

// Create a reply to a thread
export async function createReply(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  const content = formData.get("content") as string
  const threadId = formData.get("threadId") as string
  const categorySlug = formData.get("category") as string

  if (!content || !threadId || !categorySlug) {
    throw new Error("Missing required fields")
  }

  try {
    // Get the user's profile ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      throw new Error("Profile not found")
    }

    // Create the reply
    const { error: replyError } = await supabase.from("forum_replies").insert({
      thread_id: threadId,
      profile_id: profile.id,
      content,
    })

    if (replyError) {
      throw replyError
    }

    revalidatePath(`/community/${categorySlug}/${threadId}`)
    return { success: true }
  } catch (error) {
    console.error("Error creating reply:", error)
    throw error
  }
}

// Like a thread or reply
export async function toggleLike(type: "thread" | "reply", id: string, categorySlug: string, threadId?: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Unauthorized")
  }

  try {
    // Check if the user has already liked this item
    const { data: existingLike, error: likeError } = await supabase
      .from("forum_likes")
      .select("id")
      .eq("profile_id", user.id)
      .eq(type === "thread" ? "thread_id" : "reply_id", id)
      .maybeSingle()

    if (likeError) {
      throw likeError
    }

    if (existingLike) {
      // Unlike
      const { error: unlikeError } = await supabase.from("forum_likes").delete().eq("id", existingLike.id)

      if (unlikeError) {
        throw unlikeError
      }
    } else {
      // Like
      const { error: createLikeError } = await supabase.from("forum_likes").insert({
        profile_id: user.id,
        [type === "thread" ? "thread_id" : "reply_id"]: id,
      })

      if (createLikeError) {
        throw createLikeError
      }
    }

    if (threadId) {
      revalidatePath(`/community/${categorySlug}/${threadId}`)
    } else {
      revalidatePath(`/community/${categorySlug}`)
    }

    return { success: true, liked: !existingLike }
  } catch (error) {
    console.error("Error toggling like:", error)
    throw error
  }
}
