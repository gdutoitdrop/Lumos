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
    username: string
    full_name: string
    avatar_url?: string
  }
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  other_user: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  last_message?: Message
  unread_count: number
}

export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  mental_health_badges?: string[]
  current_mood?: string
  gender?: string
  age?: number
  location?: string
}

class MessagingService {
  private supabase = createClient()

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log("Fetching conversations for user:", userId)

      // First, get all conversation IDs where the user is a participant
      const { data: participantData, error: participantError } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (participantError) {
        console.error("Error fetching participant data:", participantError)
        return this.getDemoConversations()
      }

      if (!participantData || participantData.length === 0) {
        console.log("No conversations found for user")
        return this.getDemoConversations()
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
        return this.getDemoConversations()
      }

      // For each conversation, get the other participant and last message
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          // Get other participants (not the current user)
          const { data: otherParticipants, error: otherParticipantsError } = await this.supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id)
            .neq("user_id", userId)

          if (otherParticipantsError || !otherParticipants || otherParticipants.length === 0) {
            return null
          }

          const otherUserId = otherParticipants[0].user_id

          // Get other user's profile
          const { data: otherUserProfile, error: profileError } = await this.supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", otherUserId)
            .single()

          if (profileError || !otherUserProfile) {
            return null
          }

          // Get last message
          const { data: lastMessages, error: lastMessageError } = await this.supabase
            .from("messages")
            .select(`
              id,
              conversation_id,
              sender_id,
              content,
              message_type,
              created_at,
              is_read
            `)
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

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            other_user: otherUserProfile,
            last_message: lastMessages && lastMessages.length > 0 ? lastMessages[0] : undefined,
            unread_count: unreadCount || 0,
          }
        }),
      )

      // Filter out null results
      const validConversations = conversationsWithDetails.filter((conv) => conv !== null) as Conversation[]

      console.log("Fetched conversations:", validConversations)
      return validConversations
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return this.getDemoConversations()
    }
  }

  private getDemoConversations(): Conversation[] {
    return [
      {
        id: "demo-conv-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: "demo-user-1",
          username: "sarah_j",
          full_name: "Sarah Johnson",
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
          username: "mike_chen",
          full_name: "Mike Chen",
          avatar_url: undefined,
        },
        last_message: {
          id: "demo-msg-2",
          conversation_id: "demo-conv-2",
          sender_id: "current-user",
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
      if (conversationId.startsWith("demo-")) {
        return this.getDemoMessages(conversationId)
      }

      const { data: messages, error } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return this.getDemoMessages(conversationId)
      }

      // Get sender profiles for each message
      const messagesWithSenders = await Promise.all(
        (messages || []).map(async (msg) => {
          const { data: senderProfile } = await this.supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", msg.sender_id)
            .single()

          return {
            ...msg,
            sender: senderProfile || {
              username: "unknown",
              full_name: "Unknown User",
              avatar_url: undefined,
            },
          }
        }),
      )

      return messagesWithSenders
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
        sender: {
          username: "sarah_j",
          full_name: "Sarah Johnson",
          avatar_url: undefined,
        },
      },
      {
        id: "demo-msg-2",
        conversation_id: conversationId,
        sender_id: "current-user",
        content: "Hi! It's going well, thanks for asking. How about you?",
        message_type: "text",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
        sender: {
          username: "you",
          full_name: "You",
          avatar_url: undefined,
        },
      },
    ]
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
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

      const { data: message, error } = await this.supabase
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

      // Get sender profile
      const { data: senderProfile } = await this.supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", senderId)
        .single()

      return {
        ...message,
        sender: senderProfile || {
          username: "unknown",
          full_name: "Unknown User",
          avatar_url: undefined,
        },
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

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data: profile, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return profile
    } catch (error) {
      console.error("Error in getProfile:", error)
      return null
    }
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
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
        async (payload) => {
          // Fetch the complete message with sender info
          const { data: senderProfile } = await this.supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", payload.new.sender_id)
            .single()

          callback({
            ...payload.new,
            sender: senderProfile || {
              username: "unknown",
              full_name: "Unknown User",
              avatar_url: undefined,
            },
          })
        },
      )
      .subscribe()
  }
}

export const messagingService = new MessagingService()
