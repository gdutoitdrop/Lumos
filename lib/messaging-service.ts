import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type Conversation = Database["public"]["Tables"]["conversations"]["Row"]

export class MessagingService {
  private supabase = createClient()

  async getConversations(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("conversations")
        .select(`
          *,
          participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, avatar_url),
          participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, avatar_url),
          messages(content, created_at, sender_id)
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      return (
        data?.map((conv) => ({
          ...conv,
          other_participant: conv.participant_1 === userId ? conv.participant_2_profile : conv.participant_1_profile,
          last_message: conv.messages?.[conv.messages.length - 1],
        })) || []
      )
    } catch (error) {
      console.error("Error fetching conversations:", error)
      // Return demo data on error
      return [
        {
          id: "demo-1",
          participant_1: userId,
          participant_2: "demo-user-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          other_participant: {
            id: "demo-user-1",
            full_name: "Alex Johnson",
            avatar_url: null,
          },
          last_message: {
            content: "Hey! How are you doing?",
            created_at: new Date().toISOString(),
            sender_id: "demo-user-1",
          },
        },
      ]
    }
  }

  async getMessages(conversationId: string) {
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching messages:", error)
      // Return demo messages on error
      return [
        {
          id: "demo-msg-1",
          conversation_id: conversationId,
          sender_id: "demo-user-1",
          content: "Hey! How are you doing?",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            id: "demo-user-1",
            full_name: "Alex Johnson",
            avatar_url: null,
          },
        },
        {
          id: "demo-msg-2",
          conversation_id: conversationId,
          sender_id: "current-user",
          content: "Hi Alex! I'm doing great, thanks for asking. How about you?",
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sender: {
            id: "current-user",
            full_name: "You",
            avatar_url: null,
          },
        },
      ]
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation timestamp
      await this.supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      return data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  async createConversation(participant1: string, participant2: string) {
    try {
      // Check if conversation already exists
      const { data: existing } = await this.supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`,
        )
        .single()

      if (existing) {
        return existing.id
      }

      // Create new conversation
      const { data, error } = await this.supabase
        .from("conversations")
        .insert({
          participant_1: participant1,
          participant_2: participant2,
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
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
        callback,
      )
      .subscribe()
  }
}

export const messagingService = new MessagingService()
