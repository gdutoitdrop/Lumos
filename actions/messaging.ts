"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

// Add the createConversation function that was missing
export async function createConversation(otherUserId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if a conversation already exists between these users
  const { data: userConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id)

  if (!userConversations || userConversations.length === 0) {
    // No conversations yet, create a new one
    return createNewConversation(user.id, otherUserId, supabase)
  }

  const conversationIds = userConversations.map((c) => c.conversation_id)

  // Check if the other user is in any of these conversations
  const { data: otherUserParticipations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", otherUserId)
    .in("conversation_id", conversationIds)

  if (otherUserParticipations && otherUserParticipations.length > 0) {
    // Conversation already exists
    return { conversationId: otherUserParticipations[0].conversation_id }
  }

  // Create a new conversation
  return createNewConversation(user.id, otherUserId, supabase)
}

// Helper function to create a new conversation
async function createNewConversation(userId: string, otherUserId: string, supabase: any) {
  // Create a new conversation
  const conversationId = uuidv4()
  const { error: conversationError } = await supabase.from("conversations").insert({ id: conversationId })

  if (conversationError) {
    return { error: "Failed to create conversation" }
  }

  // Add participants to the conversation
  const { error: participantsError } = await supabase.from("conversation_participants").insert([
    { conversation_id: conversationId, profile_id: userId },
    { conversation_id: conversationId, profile_id: otherUserId },
  ])

  if (participantsError) {
    return { error: "Failed to add participants" }
  }

  return { conversationId }
}

export async function startConversation(matchId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get the match details to find both participants
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("user1_id, user2_id")
    .eq("id", matchId)
    .single()

  if (matchError || !match) {
    return { error: "Match not found" }
  }

  // Determine the other user ID
  const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id

  // Use the createConversation function to handle the rest
  return createConversation(otherUserId)
}

export async function sendMessage(conversationId: string, content: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if the user is a participant in this conversation
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select()
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single()

  if (participantError || !participant) {
    return { error: "Not authorized to send messages in this conversation" }
  }

  // Send the message
  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    profile_id: user.id,
    content,
  })

  if (messageError) {
    return { error: "Failed to send message" }
  }

  revalidatePath(`/messages/${conversationId}`)
  return { success: true }
}

export async function getConversations() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { conversations: [] }
  }

  // Get all conversations where the user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id)

  if (participationsError || !participations.length) {
    return { conversations: [] }
  }

  const conversationIds = participations.map((p) => p.conversation_id)

  // Get the conversations with the latest message and other participant info
  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      conversation_participants!inner(profile_id),
      messages!inner(id, content, created_at, profile_id)
    `)
    .in("id", conversationIds)
    .order("created_at", { foreignTable: "messages", ascending: false })

  if (conversationsError) {
    return { conversations: [] }
  }

  // Get the other participants' profiles
  const otherParticipantIds = conversations.flatMap((conv) =>
    conv.conversation_participants.filter((p) => p.profile_id !== user.id).map((p) => p.profile_id),
  )

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", otherParticipantIds)

  if (profilesError) {
    return { conversations: [] }
  }

  // Format the conversations with the other participant's info
  const formattedConversations = conversations.map((conv) => {
    const otherParticipantId = conv.conversation_participants.find((p) => p.profile_id !== user.id)?.profile_id

    const otherParticipant = profiles.find((p) => p.id === otherParticipantId)

    return {
      id: conv.id,
      otherParticipant,
      lastMessage: conv.messages[0],
      created_at: conv.created_at,
    }
  })

  return { conversations: formattedConversations }
}

export async function getConversation(conversationId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Check if the user is a participant in this conversation
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select()
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single()

  if (participantError || !participant) {
    redirect("/messages")
  }

  // Get the other participant
  const { data: otherParticipant, error: otherParticipantError } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .neq("profile_id", user.id)
    .single()

  if (otherParticipantError) {
    redirect("/messages")
  }

  // Get the other participant's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", otherParticipant.profile_id)
    .single()

  if (profileError) {
    redirect("/messages")
  }

  // Get the messages
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      profile_id,
      is_read
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (messagesError) {
    return { conversation: null, messages: [], otherParticipant: profile }
  }

  // Mark unread messages as read
  const unreadMessages = messages.filter((m) => m.profile_id !== user.id && !m.is_read).map((m) => m.id)

  if (unreadMessages.length > 0) {
    await supabase.from("messages").update({ is_read: true }).in("id", unreadMessages)
  }

  return {
    conversation: { id: conversationId },
    messages,
    otherParticipant: profile,
  }
}
