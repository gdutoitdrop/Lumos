import { createClient } from "@/lib/supabase/client"

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: ConversationParticipant[]
  last_message?: Message
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  profile?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read_by: string[]
  sender_profile?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

export class MessagingService {
  private supabase = createClient()

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (participantError) throw participantError

      const conversationIds = participantData.map((p) => p.conversation_id)

      if (conversationIds.length === 0) return []

      // Get conversation details
      const { data: conversations, error: conversationsError } = await this.supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (conversationsError) throw conversationsError

      // Get all participants for these conversations
      const { data: allParticipants, error: allParticipantsError } = await this.supabase
        .from("conversation_participants")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .in("conversation_id", conversationIds)

      if (allParticipantsError) throw allParticipantsError

      // Get last message for each conversation
      const { data: lastMessages, error: lastMessagesError } = await this.supabase
        .from("messages")
        .select(`
          *,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })

      if (lastMessagesError) throw lastMessagesError

      // Combine data
      const result: Conversation[] = conversations.map((conv) => {
        const participants = allParticipants
          .filter((p) => p.conversation_id === conv.id)
          .map((p) => ({
            ...p,
            profile: p.profiles,
          }))

        const lastMessage = lastMessages.find((m) => m.conversation_id === conv.id)

        return {
          ...conv,
          participants,
          last_message: lastMessage
            ? {
                ...lastMessage,
                sender_profile: lastMessage.profiles,
              }
            : undefined,
        }
      })

      return result
    } catch (error) {
      console.error("Error fetching conversations:", error)
      throw error
    }
  }

  async createConversation(currentUserId: string, otherUserId: string): Promise<string> {
    try {
      // Check if conversation already exists between these users
      const existingConversation = await this.findExistingConversation(currentUserId, otherUserId)
      if (existingConversation) {
        return existingConversation.id
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await this.supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (conversationError) throw conversationError

      // Add participants
      const { error: participantsError } = await this.supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, user_id: currentUserId },
        { conversation_id: conversation.id, user_id: otherUserId },
      ])

      if (participantsError) throw participantsError

      return conversation.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }

  async findExistingConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
    try {
      // Get conversations where user1 is a participant
      const { data: user1Conversations, error: user1Error } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user1Id)

      if (user1Error) throw user1Error

      // Get conversations where user2 is a participant
      const { data: user2Conversations, error: user2Error } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user2Id)

      if (user2Error) throw user2Error

      // Find common conversations
      const user1ConvIds = user1Conversations.map((c) => c.conversation_id)
      const user2ConvIds = user2Conversations.map((c) => c.conversation_id)
      const commonConvIds = user1ConvIds.filter((id) => user2ConvIds.includes(id))

      if (commonConvIds.length === 0) return null

      // For each common conversation, check if it has exactly 2 participants (direct message)
      for (const convId of commonConvIds) {
        const { data: participants, error: participantsError } = await this.supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convId)

        if (participantsError) continue

        if (participants.length === 2) {
          // This is a direct message conversation
          const { data: conversation, error: conversationError } = await this.supabase
            .from("conversations")
            .select("*")
            .eq("id", convId)
            .single()

          if (conversationError) continue

          return {
            ...conversation,
            participants: [],
            last_message: undefined,
          }
        }
      }

      return null
    } catch (error) {
      console.error("Error finding existing conversation:", error)
      return null
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from("messages")
        .select(`
          *,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error

      return messages.map((message) => ({
        ...message,
        sender_profile: message.profiles,
      }))
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    try {
      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
          read_by: [senderId],
        })
        .select(`
          *,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      return {
        ...message,
        sender_profile: message.profiles,
      }
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      // Get current read_by array
      const { data: message, error: fetchError } = await this.supabase
        .from("messages")
        .select("read_by")
        .eq("id", messageId)
        .single()

      if (fetchError) throw fetchError

      const currentReadBy = message.read_by || []
      if (!currentReadBy.includes(userId)) {
        const newReadBy = [...currentReadBy, userId]

        const { error: updateError } = await this.supabase
          .from("messages")
          .update({ read_by: newReadBy })
          .eq("id", messageId)

        if (updateError) throw updateError
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
      throw error
    }
  }

  subscribeToConversation(conversationId: string, onMessage: (message: Message) => void) {
    return this.supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data: message, error } = await this.supabase
            .from("messages")
            .select(`
              *,
              profiles:sender_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("id", payload.new.id)
            .single()

          if (!error && message) {
            onMessage({
              ...message,
              sender_profile: message.profiles,
            })
          }
        },
      )
      .subscribe()
  }
}

export const messagingService = new MessagingService()
