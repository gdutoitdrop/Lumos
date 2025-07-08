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
  participants: Array<{
    user_id: string
    profile?: {
      username: string
      full_name: string
      avatar_url?: string
    }
  }>
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

  // Helper function to validate UUID format
  private isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== "string") return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Helper function to clean conversation ID
  private cleanConversationId(conversationId: string): string {
    if (!conversationId || typeof conversationId !== "string") {
      return "demo-conversation"
    }

    // Remove prefixes that might cause issues
    let cleanId = conversationId
    if (cleanId.startsWith("match-")) {
      cleanId = cleanId.replace("match-", "")
    }
    if (cleanId.startsWith("conv-")) {
      cleanId = cleanId.replace("conv-", "")
    }

    return cleanId
  }

  // Demo data for fallback
  private getDemoConversations(): Conversation[] {
    return [
      {
        id: "demo-conv-1",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        participants: [
          {
            user_id: "demo-user-1",
            profile: {
              username: "sarah_j",
              full_name: "Sarah Johnson",
              avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
            },
          },
        ],
        last_message: {
          id: "demo-msg-1",
          conversation_id: "demo-conv-1",
          sender_id: "demo-user-1",
          content: "Hey! How are you doing today?",
          message_type: "text",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: false,
        },
        unread_count: 1,
      },
      {
        id: "demo-conv-2",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
        participants: [
          {
            user_id: "demo-user-2",
            profile: {
              username: "mike_chen",
              full_name: "Mike Chen",
              avatar_url: "/placeholder.svg?height=40&width=40&text=MC",
            },
          },
        ],
        last_message: {
          id: "demo-msg-2",
          conversation_id: "demo-conv-2",
          sender_id: "demo-user-2",
          content: "Thanks for the great conversation!",
          message_type: "text",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          is_read: true,
        },
        unread_count: 0,
      },
    ]
  }

  private getDemoMessages(conversationId: string): Message[] {
    const cleanId = this.cleanConversationId(conversationId)

    return [
      {
        id: "demo-msg-1",
        conversation_id: cleanId,
        sender_id: "demo-user-1",
        content: "Hey there! How's your day going?",
        message_type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
        sender: {
          username: "sarah_j",
          full_name: "Sarah Johnson",
          avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
        },
      },
      {
        id: "demo-msg-2",
        conversation_id: cleanId,
        sender_id: "current-user",
        content: "Hi! It's going well, thanks for asking. How about you?",
        message_type: "text",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
        sender: {
          username: "you",
          full_name: "You",
          avatar_url: "/placeholder.svg?height=40&width=40&text=You",
        },
      },
      {
        id: "demo-msg-3",
        conversation_id: cleanId,
        sender_id: "demo-user-1",
        content: "I'm doing great! I love this platform for connecting with people who understand.",
        message_type: "text",
        created_at: new Date(Date.now() - 900000).toISOString(),
        is_read: false,
        sender: {
          username: "sarah_j",
          full_name: "Sarah Johnson",
          avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
        },
      },
    ]
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      if (!userId || typeof userId !== "string") {
        console.warn("Invalid user ID provided to getUserConversations:", userId)
        return this.getDemoConversations()
      }

      console.log("Fetching conversations for user:", userId)

      // Get conversation participants for this user
      const { data: participantData, error: participantError } = await this.supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner(
            id,
            created_at,
            updated_at
          )
        `)
        .eq("user_id", userId)

      if (participantError) {
        console.error("Error fetching participant data:", participantError)
        return this.getDemoConversations()
      }

      if (!participantData || participantData.length === 0) {
        console.log("No conversations found for user, returning demo data")
        return this.getDemoConversations()
      }

      // Get detailed conversation data
      const conversationsWithDetails = await Promise.all(
        participantData.map(async (item: any) => {
          const conversationId = item.conversation_id
          const conversation = item.conversations

          // Get all participants for this conversation (excluding current user)
          const { data: allParticipants, error: participantsError } = await this.supabase
            .from("conversation_participants")
            .select(`
              user_id,
              profiles(
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("conversation_id", conversationId)
            .neq("user_id", userId)

          if (participantsError) {
            console.error("Error fetching participants:", participantsError)
            return null
          }

          // Get last message
          const { data: lastMessages, error: messagesError } = await this.supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)

          if (messagesError) {
            console.error("Error fetching last message:", messagesError)
          }

          // Get unread count
          const { count: unreadCount } = await this.supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversationId)
            .eq("is_read", false)
            .neq("sender_id", userId)

          return {
            id: conversation.id,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            participants: (allParticipants || []).map((p: any) => ({
              user_id: p.user_id,
              profile: p.profiles
                ? {
                    username: p.profiles.username,
                    full_name: p.profiles.full_name,
                    avatar_url: p.profiles.avatar_url,
                  }
                : null,
            })),
            last_message: lastMessages && lastMessages.length > 0 ? lastMessages[0] : undefined,
            unread_count: unreadCount || 0,
          }
        }),
      )

      // Filter out null results and return
      const validConversations = conversationsWithDetails.filter((conv) => conv !== null) as Conversation[]

      if (validConversations.length === 0) {
        return this.getDemoConversations()
      }

      return validConversations
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return this.getDemoConversations()
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      if (!conversationId || typeof conversationId !== "string") {
        console.warn("Invalid conversation ID provided:", conversationId)
        return this.getDemoMessages("demo-conversation")
      }

      const cleanId = this.cleanConversationId(conversationId)

      // If it's a demo conversation or invalid UUID, return demo data
      if (cleanId.startsWith("demo-") || !this.isValidUUID(cleanId)) {
        console.log("Using demo messages for conversation:", cleanId)
        return this.getDemoMessages(cleanId)
      }

      console.log("Fetching messages for conversation:", cleanId)

      const { data: messages, error } = await this.supabase
        .from("messages")
        .select(`
          *,
          profiles!messages_sender_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("conversation_id", cleanId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return this.getDemoMessages(cleanId)
      }

      if (!messages || messages.length === 0) {
        console.log("No messages found, using demo data")
        return this.getDemoMessages(cleanId)
      }

      // Transform messages to include sender info
      const transformedMessages: Message[] = messages.map((msg: any) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender: msg.profiles
          ? {
              username: msg.profiles.username,
              full_name: msg.profiles.full_name,
              avatar_url: msg.profiles.avatar_url,
            }
          : {
              username: "unknown",
              full_name: "Unknown User",
              avatar_url: "/placeholder.svg?height=40&width=40&text=?",
            },
      }))

      return transformedMessages
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      return this.getDemoMessages(conversationId)
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      if (
        !conversationId ||
        !senderId ||
        !content ||
        typeof conversationId !== "string" ||
        typeof senderId !== "string" ||
        typeof content !== "string"
      ) {
        console.warn("Invalid parameters for sendMessage:", { conversationId, senderId, content })

        // Return demo message for UI consistency
        return {
          id: `demo-${Date.now()}`,
          conversation_id: conversationId || "demo-conversation",
          sender_id: senderId || "demo-user",
          content: content || "Demo message",
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
      }

      const cleanId = this.cleanConversationId(conversationId)

      // If it's a demo conversation or invalid UUID, return demo message
      if (cleanId.startsWith("demo-") || !this.isValidUUID(cleanId)) {
        console.log("Sending demo message for conversation:", cleanId)
        return {
          id: `demo-${Date.now()}`,
          conversation_id: cleanId,
          sender_id: senderId,
          content: content.trim(),
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
      }

      console.log("Sending message to conversation:", cleanId)

      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: cleanId,
          sender_id: senderId,
          content: content.trim(),
          message_type: "text",
        })
        .select(`
          *,
          profiles!messages_sender_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error("Error sending message:", error)
        // Return demo message as fallback
        return {
          id: `demo-${Date.now()}`,
          conversation_id: cleanId,
          sender_id: senderId,
          content: content.trim(),
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
      }

      // Transform the response
      const transformedMessage: Message = {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        message_type: message.message_type,
        created_at: message.created_at,
        is_read: message.is_read,
        sender: message.profiles
          ? {
              username: message.profiles.username,
              full_name: message.profiles.full_name,
              avatar_url: message.profiles.avatar_url,
            }
          : {
              username: "unknown",
              full_name: "Unknown User",
              avatar_url: "/placeholder.svg?height=40&width=40&text=?",
            },
      }

      return transformedMessage
    } catch (error) {
      console.error("Error in sendMessage:", error)
      // Return demo message as fallback
      return {
        id: `demo-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: false,
      }
    }
  }

  async createConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      if (!userId1 || !userId2 || typeof userId1 !== "string" || typeof userId2 !== "string") {
        console.warn("Invalid user IDs for conversation creation:", { userId1, userId2 })
        return `demo-conv-${Date.now()}`
      }

      if (userId1 === userId2) {
        console.warn("Cannot create conversation with same user")
        return null
      }

      // Check if conversation already exists between these users
      const existingConversation = await this.findExistingConversation(userId1, userId2)
      if (existingConversation) {
        return existingConversation
      }

      console.log("Creating new conversation between:", userId1, userId2)

      // Create new conversation
      const { data: conversation, error: convError } = await this.supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        return `demo-conv-${Date.now()}`
      }

      // Add participants
      const { error: participantsError } = await this.supabase.from("conversation_participants").insert([
        { conversation_id: conversation.id, user_id: userId1 },
        { conversation_id: conversation.id, user_id: userId2 },
      ])

      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        return `demo-conv-${Date.now()}`
      }

      return conversation.id
    } catch (error) {
      console.error("Error in createConversation:", error)
      return `demo-conv-${Date.now()}`
    }
  }

  private async findExistingConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      // Get conversations where userId1 is a participant
      const { data: user1Conversations, error: error1 } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId1)

      if (error1 || !user1Conversations) return null

      // Get conversations where userId2 is a participant
      const { data: user2Conversations, error: error2 } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId2)

      if (error2 || !user2Conversations) return null

      // Find common conversations
      const user1ConvIds = user1Conversations.map((c) => c.conversation_id)
      const user2ConvIds = user2Conversations.map((c) => c.conversation_id)

      const commonConversations = user1ConvIds.filter((id) => user2ConvIds.includes(id))

      if (commonConversations.length > 0) {
        return commonConversations[0] // Return the first common conversation
      }

      return null
    } catch (error) {
      console.error("Error finding existing conversation:", error)
      return null
    }
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    try {
      if (!conversationId || typeof conversationId !== "string") {
        console.warn("Invalid conversation ID for subscription:", conversationId)
        return { unsubscribe: () => {} }
      }

      const cleanId = this.cleanConversationId(conversationId)

      // Don't subscribe to demo conversations or invalid UUIDs
      if (cleanId.startsWith("demo-") || !this.isValidUUID(cleanId)) {
        console.log("Skipping subscription for demo/invalid conversation:", cleanId)
        return { unsubscribe: () => {} }
      }

      console.log("Subscribing to messages for conversation:", cleanId)

      const subscription = this.supabase
        .channel(`messages:${cleanId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${cleanId}`,
          },
          async (payload) => {
            if (payload.new) {
              // Fetch sender profile for the new message
              const { data: senderProfile } = await this.supabase
                .from("profiles")
                .select("username, full_name, avatar_url")
                .eq("id", payload.new.sender_id)
                .single()

              const messageWithSender: Message = {
                ...(payload.new as Message),
                sender: senderProfile || {
                  username: "unknown",
                  full_name: "Unknown User",
                  avatar_url: "/placeholder.svg?height=40&width=40&text=?",
                },
              }

              callback(messageWithSender)
            }
          },
        )
        .subscribe()

      return subscription
    } catch (error) {
      console.error("Error subscribing to messages:", error)
      return { unsubscribe: () => {} }
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      if (!userId || typeof userId !== "string") {
        console.warn("Invalid user ID for profile fetch:", userId)
        return null
      }

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
}

export const messagingService = new MessagingService()
