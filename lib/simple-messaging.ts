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
  other_user?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  last_message?: Message
  unread_count: number
}

class MessagingService {
  private supabase = createClient()

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (participantError) {
        console.error("Error fetching participant data:", participantError)
        return this.getDemoConversations(userId)
      }

      if (!participantData || participantData.length === 0) {
        return this.getDemoConversations(userId)
      }

      const conversationIds = participantData.map((p) => p.conversation_id)

      // Get conversation details
      const { data: conversations, error: conversationError } = await this.supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (conversationError) {
        console.error("Error fetching conversations:", conversationError)
        return this.getDemoConversations(userId)
      }

      // Get other participants for each conversation
      const conversationsWithUsers = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Get other participants
          const { data: otherParticipants } = await this.supabase
            .from("conversation_participants")
            .select(`
              user_id,
              profiles (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("conversation_id", conv.id)
            .neq("user_id", userId)
            .limit(1)

          // Get last message
          const { data: lastMessage } = await this.supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)

          // Get unread count
          const { count: unreadCount } = await this.supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", userId)

          const otherUser = otherParticipants?.[0]
          const profile = otherUser?.profiles

          return {
            ...conv,
            other_user: profile
              ? {
                  id: otherUser.user_id,
                  name: profile.full_name || profile.username || "Unknown User",
                  username: profile.username || "unknown",
                  avatar_url: profile.avatar_url,
                }
              : undefined,
            last_message: lastMessage?.[0],
            unread_count: unreadCount || 0,
          }
        }),
      )

      return conversationsWithUsers
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return this.getDemoConversations(userId)
    }
  }

  private getDemoConversations(userId: string): Conversation[] {
    return [
      {
        id: "demo-conv-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: "demo-user-1",
          name: "Sarah Johnson",
          username: "sarah_j",
          avatar_url: undefined,
        },
        last_message: {
          id: "demo-msg-1",
          conversation_id: "demo-conv-1",
          sender_id: "demo-user-1",
          content: "Hey! How are you doing today?",
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        },
        unread_count: 1,
      },
      {
        id: "demo-conv-2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: "demo-user-2",
          name: "Mike Chen",
          username: "mike_c",
          avatar_url: undefined,
        },
        last_message: {
          id: "demo-msg-2",
          conversation_id: "demo-conv-2",
          sender_id: userId,
          content: "Thanks for the great conversation!",
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: true,
        },
        unread_count: 0,
      },
    ]
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      // Don't query database if it's a demo conversation
      if (conversationId.startsWith("demo-")) {
        return this.getDemoMessages(conversationId)
      }

      const { data, error } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return this.getDemoMessages(conversationId)
      }

      return data || []
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      return this.getDemoMessages(conversationId)
    }
  }

  private getDemoMessages(conversationId: string): Message[] {
    return [
      {
        id: "demo-msg-1",
        conversation_id: conversationId,
        sender_id: "demo-user-1",
        content: "Hey there! How's your day going?",
        message_type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-2",
        conversation_id: conversationId,
        sender_id: "current-user",
        content: "Hi! It's going well, thanks for asking. How about you?",
        message_type: "text",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-3",
        conversation_id: conversationId,
        sender_id: "demo-user-1",
        content: "Pretty good! Just working on some projects. What are you up to?",
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ]
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      // Don't send to database if it's a demo conversation
      if (conversationId.startsWith("demo-")) {
        return {
          id: `demo-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
      }

      const { data, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
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

      return data
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
    // Don't subscribe to demo conversations
    if (conversationId.startsWith("demo-")) {
      return { unsubscribe: () => {} }
    }

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
