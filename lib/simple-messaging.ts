import { createClient } from "@/lib/supabase/client"

export interface SimpleMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  message_type: string
  is_read: boolean
}

export interface SimpleConversation {
  id: string
  created_at: string
  updated_at: string
  participants: string[]
  last_message?: SimpleMessage
}

class SimpleMessagingService {
  private supabase = createClient()

  async getConversations(userId: string): Promise<SimpleConversation[]> {
    try {
      console.log("Fetching conversations for user:", userId)

      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (participantError) {
        console.error("Error fetching participants:", participantError)
        return []
      }

      if (!participantData || participantData.length === 0) {
        console.log("No conversations found")
        return []
      }

      const conversationIds = participantData.map((p) => p.conversation_id)

      // Get conversation details
      const { data: conversations, error: conversationsError } = await this.supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError)
        return []
      }

      // Get participants for each conversation
      const { data: allParticipants, error: allParticipantsError } = await this.supabase
        .from("conversation_participants")
        .select("*")
        .in("conversation_id", conversationIds)

      if (allParticipantsError) {
        console.error("Error fetching all participants:", allParticipantsError)
      }

      // Get last message for each conversation
      const { data: lastMessages, error: lastMessagesError } = await this.supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })

      if (lastMessagesError) {
        console.error("Error fetching last messages:", lastMessagesError)
      }

      // Combine data
      const result: SimpleConversation[] = conversations.map((conv) => {
        const participants = allParticipants?.filter((p) => p.conversation_id === conv.id)?.map((p) => p.user_id) || []

        const lastMessage = lastMessages?.find((m) => m.conversation_id === conv.id)

        return {
          ...conv,
          participants,
          last_message: lastMessage,
        }
      })

      console.log("Fetched conversations:", result)
      return result
    } catch (error) {
      console.error("Error in getConversations:", error)
      return []
    }
  }

  async getMessages(conversationId: string): Promise<SimpleMessage[]> {
    try {
      console.log("Fetching messages for conversation:", conversationId)

      const { data: messages, error } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return []
      }

      console.log("Fetched messages:", messages)
      return messages || []
    } catch (error) {
      console.error("Error in getMessages:", error)
      return []
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<SimpleMessage | null> {
    try {
      console.log("Sending message:", { conversationId, senderId, content })

      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
          message_type: "text",
        })
        .select()
        .single()

      if (error) {
        console.error("Error sending message:", error)
        return null
      }

      // Update conversation timestamp
      await this.supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      console.log("Message sent:", message)
      return message
    } catch (error) {
      console.error("Error in sendMessage:", error)
      return null
    }
  }

  async createConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      console.log("Creating conversation between:", userId1, userId2)

      // Check if conversation already exists
      const existing = await this.findExistingConversation(userId1, userId2)
      if (existing) {
        console.log("Found existing conversation:", existing)
        return existing
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await this.supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (conversationError) {
        console.error("Error creating conversation:", conversationError)
        return null
      }

      // Add participants
      const { error: participantsError } = await this.supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, user_id: userId1 },
        { conversation_id: conversation.id, user_id: userId2 },
      ])

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        return null
      }

      console.log("Created conversation:", conversation.id)
      return conversation.id
    } catch (error) {
      console.error("Error in createConversation:", error)
      return null
    }
  }

  async findExistingConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      // Get conversations for user1
      const { data: user1Convs, error: error1 } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId1)

      if (error1) return null

      // Get conversations for user2
      const { data: user2Convs, error: error2 } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId2)

      if (error2) return null

      // Find common conversations
      const user1ConvIds = user1Convs?.map((c) => c.conversation_id) || []
      const user2ConvIds = user2Convs?.map((c) => c.conversation_id) || []
      const commonConvIds = user1ConvIds.filter((id) => user2ConvIds.includes(id))

      if (commonConvIds.length === 0) return null

      // Check if any common conversation has exactly 2 participants (direct message)
      for (const convId of commonConvIds) {
        const { data: participants, error } = await this.supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convId)

        if (!error && participants && participants.length === 2) {
          return convId
        }
      }

      return null
    } catch (error) {
      console.error("Error finding existing conversation:", error)
      return null
    }
  }

  subscribeToMessages(conversationId: string, onMessage: (message: SimpleMessage) => void) {
    console.log("Subscribing to messages for conversation:", conversationId)

    return this.supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Received new message:", payload.new)
          onMessage(payload.new as SimpleMessage)
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })
  }
}

export const simpleMessaging = new SimpleMessagingService()
