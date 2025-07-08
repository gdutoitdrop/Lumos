import { createClient } from "@/lib/supabase/client"

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  conversation_type: "direct" | "group"
  participants: ConversationParticipant[]
  last_message?: Message
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  is_active: boolean
  profile?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    bio?: string
  }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: "text" | "image" | "file" | "call_start" | "call_end"
  created_at: string
  updated_at: string
  read_by: string[]
  metadata: Record<string, any>
  sender_profile?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

export interface CallSignal {
  id: string
  call_id: string
  signal_type: "offer" | "answer" | "ice-candidate" | "call-start" | "call-end" | "call-accept" | "call-reject"
  from_user_id: string
  to_user_id: string
  call_type: "audio" | "video"
  signal_data?: any
  created_at: string
  expires_at: string
}

export class MessagingService {
  private supabase = createClient()

  // Conversation Management
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log("Fetching conversations for user:", userId)

      // Get conversations where user is a participant
      const { data: participantData, error: participantError } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)
        .eq("is_active", true)

      if (participantError) {
        console.error("Error fetching participant data:", participantError)
        throw participantError
      }

      const conversationIds = participantData.map((p) => p.conversation_id)

      if (conversationIds.length === 0) {
        console.log("No conversations found for user")
        return []
      }

      // Get conversation details
      const { data: conversations, error: conversationsError } = await this.supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError)
        throw conversationsError
      }

      // Get all participants for these conversations
      const { data: allParticipants, error: allParticipantsError } = await this.supabase
        .from("conversation_participants")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            bio
          )
        `)
        .in("conversation_id", conversationIds)
        .eq("is_active", true)

      if (allParticipantsError) {
        console.error("Error fetching participants:", allParticipantsError)
        throw allParticipantsError
      }

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

      if (lastMessagesError) {
        console.error("Error fetching last messages:", lastMessagesError)
      }

      // Combine data
      const result: Conversation[] = conversations.map((conv) => {
        const participants = allParticipants
          .filter((p) => p.conversation_id === conv.id)
          .map((p) => ({
            ...p,
            profile: p.profiles,
          }))

        const lastMessage = lastMessages?.find((m) => m.conversation_id === conv.id)

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

      console.log("Fetched conversations:", result)
      return result
    } catch (error) {
      console.error("Error fetching conversations:", error)
      throw error
    }
  }

  async createConversation(currentUserId: string, otherUserId: string): Promise<string> {
    try {
      console.log("Creating conversation between:", currentUserId, "and", otherUserId)

      // Check if conversation already exists between these users
      const existingConversation = await this.findExistingConversation(currentUserId, otherUserId)
      if (existingConversation) {
        console.log("Found existing conversation:", existingConversation.id)
        return existingConversation.id
      }

      // Create new conversation
      const { data: conversation, error: conversationError } = await this.supabase
        .from("conversations")
        .insert({
          conversation_type: "direct",
        })
        .select()
        .single()

      if (conversationError) {
        console.error("Error creating conversation:", conversationError)
        throw conversationError
      }

      // Add participants
      const { error: participantsError } = await this.supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, user_id: currentUserId, is_active: true },
        { conversation_id: conversation.id, user_id: otherUserId, is_active: true },
      ])

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        throw participantsError
      }

      console.log("Created conversation:", conversation.id)
      return conversation.id
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }

  async findExistingConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
    try {
      // Get conversations where both users are participants
      const { data: conversations, error } = await this.supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner (
            id,
            conversation_type,
            created_at,
            updated_at
          )
        `)
        .eq("user_id", user1Id)
        .eq("is_active", true)

      if (error) throw error

      // Check each conversation to see if user2 is also a participant
      for (const conv of conversations) {
        const { data: otherParticipant, error: otherError } = await this.supabase
          .from("conversation_participants")
          .select("id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", user2Id)
          .eq("is_active", true)
          .single()

        if (!otherError && otherParticipant) {
          // Check if it's a direct conversation (only 2 participants)
          const { data: allParticipants, error: countError } = await this.supabase
            .from("conversation_participants")
            .select("id")
            .eq("conversation_id", conv.conversation_id)
            .eq("is_active", true)

          if (!countError && allParticipants.length === 2) {
            return {
              id: conv.conversations.id,
              conversation_type: conv.conversations.conversation_type,
              created_at: conv.conversations.created_at,
              updated_at: conv.conversations.updated_at,
              participants: [],
              last_message: undefined,
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error("Error finding existing conversation:", error)
      return null
    }
  }

  // Message Management
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      console.log("Fetching messages for conversation:", conversationId)

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

      if (error) {
        console.error("Error fetching messages:", error)
        throw error
      }

      const result = messages.map((message) => ({
        ...message,
        sender_profile: message.profiles,
      }))

      console.log("Fetched messages:", result)
      return result
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    }
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: "text" | "image" | "file" | "call_start" | "call_end" = "text",
    metadata: Record<string, any> = {},
  ): Promise<Message> {
    try {
      console.log("Sending message:", { conversationId, senderId, content, messageType })

      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim(),
          message_type: messageType,
          read_by: [senderId],
          metadata,
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

      if (error) {
        console.error("Error sending message:", error)
        throw error
      }

      const result = {
        ...message,
        sender_profile: message.profiles,
      }

      console.log("Message sent successfully:", result)
      return result
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

  // Real-time subscriptions
  subscribeToConversation(conversationId: string, onMessage: (message: Message) => void) {
    console.log("Subscribing to conversation:", conversationId)

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
          console.log("Received new message via subscription:", payload.new)

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

  // Call Management
  async sendCallSignal(signal: Omit<CallSignal, "id" | "created_at" | "expires_at">): Promise<void> {
    try {
      console.log("Sending call signal:", signal)

      const { error } = await this.supabase.from("call_signals").insert({
        call_id: signal.call_id,
        signal_type: signal.signal_type,
        from_user_id: signal.from_user_id,
        to_user_id: signal.to_user_id,
        call_type: signal.call_type,
        signal_data: signal.signal_data,
      })

      if (error) {
        console.error("Error sending call signal:", error)
        throw error
      }

      console.log("Call signal sent successfully")
    } catch (error) {
      console.error("Error sending call signal:", error)
      throw error
    }
  }

  subscribeToCallSignals(userId: string, onSignal: (signal: CallSignal) => void) {
    console.log("Subscribing to call signals for user:", userId)

    return this.supabase
      .channel(`call-signals-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_signals",
          filter: `to_user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Received call signal:", payload.new)
          onSignal(payload.new as CallSignal)
        },
      )
      .subscribe()
  }

  async cleanupExpiredCallSignals(): Promise<void> {
    try {
      const { error } = await this.supabase.rpc("cleanup_expired_call_signals")
      if (error) {
        console.error("Error cleaning up expired call signals:", error)
      }
    } catch (error) {
      console.error("Error cleaning up expired call signals:", error)
    }
  }
}

export const messagingService = new MessagingService()
