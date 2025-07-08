import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  is_read: boolean
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: string[]
  last_message?: Message
}

class MessagingService {
  private supabase = createClient()

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Get participant data first
      const { data: participantData } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (!participantData || participantData.length === 0) {
        return []
      }

      const conversationIds = participantData.map((p) => p.conversation_id)

      // Get conversations
      const { data: conversations } = await this.supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (!conversations) return []

      // Get all participants for these conversations
      const { data: allParticipants } = await this.supabase
        .from("conversation_participants")
        .select("*")
        .in("conversation_id", conversationIds)

      // Get last messages
      const { data: lastMessages } = await this.supabase
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })

      // Combine data
      return conversations.map((conv) => ({
        ...conv,
        participants: allParticipants?.filter((p) => p.conversation_id === conv.id)?.map((p) => p.user_id) || [],
        last_message: lastMessages?.find((m) => m.conversation_id === conv.id),
      }))
    } catch (error) {
      console.error("Error fetching conversations:", error)
      return []
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      return data || []
    } catch (error) {
      console.error("Error fetching messages:", error)
      return []
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      const { data } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: "text",
        })
        .select()
        .single()

      if (data) {
        // Update conversation timestamp
        await this.supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
      }

      return data
    } catch (error) {
      console.error("Error sending message:", error)
      return null
    }
  }

  async createConversation(participantIds: string[]): Promise<string | null> {
    try {
      // Create conversation
      const { data: conversation } = await this.supabase.from("conversations").insert({}).select().single()

      if (!conversation) return null

      // Add participants
      const participants = participantIds.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
      }))

      await this.supabase.from("conversation_participants").insert(participants)

      return conversation.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      return null
    }
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return this.supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message)
        },
      )
      .subscribe()
  }
}

export const messagingService = new MessagingService()
