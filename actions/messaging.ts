"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Add the missing createConversation export
export async function createConversation(profileId: string) {
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

  // Check if a conversation already exists between these users
  const { data: userConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id)

  if (!userConversations || userConversations.length === 0) {
    // No conversations yet, create a new one
    return createNewConversation(user.id, profileId, supabase)
  }

  const conversationIds = userConversations.map((c) => c.conversation_id)

  // Check if the other user is in any of these conversations
  const { data: otherUserParticipations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", profileId)
    .in("conversation_id", conversationIds)

  if (otherUserParticipations && otherUserParticipations.length > 0) {
    // Conversation already exists
    return { conversationId: otherUserParticipations[0].conversation_id }
  }

  // Create a new conversation
  return createNewConversation(user.id, profileId, supabase)
}

// Helper function to create a new conversation
async function createNewConversation(userId: string, otherUserId: string, supabase: any) {
  // Create a new conversation
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single()

  if (conversationError || !conversation) {
    return { error: "Failed to create conversation" }
  }

  // Add participants to the conversation
  const { error: participantsError } = await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, profile_id: userId },
    { conversation_id: conversation.id, profile_id: otherUserId },
  ])

  if (participantsError) {
    return { error: "Failed to add participants" }
  }

  return { conversationId: conversation.id }
}

// Create a new conversation
export async function startConversation(matchId: string) {
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

  // Get the match details to find both participants
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("user1_id, user2_id")
    .eq("id", matchId)
    .single()

  if (matchError || !match) {
    throw new Error("Match not found")
  }

  // Determine the other user ID
  const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id

  // Use the createConversation function to handle the rest
  return createConversation(otherUserId)
}

// Send a message
export async function sendMessage(conversationId: string, content: string) {
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

  // Check if the user is a participant in this conversation
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select()
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single()

  if (participantError || !participant) {
    throw new Error("You are not a participant in this conversation")
  }

  // Send the message
  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    profile_id: user.id,
    content,
    is_read: false,
  })

  if (messageError) {
    throw new Error("Failed to send message")
  }

  revalidatePath(`/messages/${conversationId}`)
  return { success: true }
}

// Get conversations for the current user
export async function getConversations() {
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

  // Get all conversations where the user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id)

  if (participationsError) {
    throw new Error("Failed to fetch conversations")
  }

  if (participations.length === 0) {
    return []
  }

  const conversationIds = participations.map((p) => p.conversation_id)

  // Get the other participants in each conversation
  const { data: otherParticipants, error: otherParticipantsError } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      profiles:profile_id (
        id,
        username,
        full_name,
        avatar_url,
        current_mood
      )
    `)
    .in("conversation_id", conversationIds)
    .neq("profile_id", user.id)

  if (otherParticipantsError) {
    throw new Error("Failed to fetch conversation participants")
  }

  // Get the latest message for each conversation
  const { data: latestMessages, error: latestMessagesError } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false })

  if (latestMessagesError) {
    throw new Error("Failed to fetch latest messages")
  }

  // Get unread message counts
  const { data: unreadCounts, error: unreadCountsError } = await supabase
    .from("messages")
    .select("conversation_id, count", { count: "exact" })
    .in("conversation_id", conversationIds)
    .eq("is_read", false)
    .neq("profile_id", user.id)
    .group("conversation_id")

  if (unreadCountsError) {
    throw new Error("Failed to fetch unread counts")
  }

  // Combine the data
  const conversations = conversationIds.map((id) => {
    const otherParticipant = otherParticipants.find((p) => p.conversation_id === id)?.profiles
    const latestMessage = latestMessages.find((m) => m.conversation_id === id)
    const unreadCount = unreadCounts.find((c) => c.conversation_id === id)?.count || 0

    return {
      id,
      otherParticipant,
      latestMessage,
      unreadCount,
    }
  })

  // Sort by latest message
  return conversations.sort((a, b) => {
    if (!a.latestMessage) return 1
    if (!b.latestMessage) return -1
    return new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime()
  })
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string) {
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

  // Mark all messages in the conversation as read
  const { error: updateError } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("profile_id", user.id)
    .eq("is_read", false)

  if (updateError) {
    throw new Error("Failed to mark messages as read")
  }

  revalidatePath(`/messages/${conversationId}`)
  return { success: true }
}
