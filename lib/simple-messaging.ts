import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  is_read: boolean
  sender?: {
    full_name: string | null
    username: string | null
  }
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants?: Array<{
    user_id: string
    profiles: {
      full_name: string | null
      username: string | null
    }
  }>
  last_message?: Message
}

class MessagingService {
  private supabase = createClient()

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await this.supabase
        .from("conversations")
        .select(`
          id,
          created_at,
          updated_at,
          conversation_participants!inner (
            user_id,
            profiles (
              full_name,
              username
            )
          )
        `)
        .eq("conversation_participants.user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching conversations:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return []
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          created_at,
          is_read,
          profiles (
            full_name,
            username
          )
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return []
      }

      return (
        data?.map((msg) => ({
          ...msg,
          sender: msg.profiles,
        })) || []
      )
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      return []
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: "text",
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          created_at,
          is_read,
          profiles (
            full_name,
            username
          )
        `)
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

      return {
        ...data,
        sender: data.profiles,
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      return null
    }
  }

  async createConversation(participantIds: string[]): Promise<string | null> {
    try {
      // Create conversation
      const { data: conversation, error: convError } = await this.supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        return null
      }

      // Add participants
      const participants = participantIds.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
      }))

      const { error: participantsError } = await this.supabase.from("conversation_participants").insert(participants)

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        return null
      }

      return conversation.id
    } catch (error) {
      console.error("Error in createConversation:", error)
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
        async (payload) => {
          // Fetch the complete message with sender info
          const { data } = await this.supabase
            .from("messages")
            .select(`
              id,
              conversation_id,
              sender_id,
              content,
              message_type,
              created_at,
              is_read,
              profiles (
                full_name,
                username
              )
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            callback({
              ...data,
              sender: data.profiles,
            })
          }
        },
      )
      .subscribe()
  }
}

export const messagingService = new MessagingService()
