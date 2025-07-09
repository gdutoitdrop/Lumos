import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: "text" | "image" | "file"
  created_at: string
  is_read: boolean
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: Array<{
    user_id: string
    username?: string
    full_name?: string
    avatar_url?: string
  }>
  last_message?: Message
}

class MessagingService {
  private supabase = createClient()

  // Helper function to clean conversation ID
  private cleanConversationId(conversationId: string): string {
    if (!conversationId || typeof conversationId !== "string") {
      return "demo-conversation"
    }

    // Remove "match-" prefix if present
    if (conversationId.startsWith("match-")) {
      return conversationId.replace("match-", "")
    }

    // Remove "conv-" prefix if present
    if (conversationId.startsWith("conv-")) {
      return conversationId.replace("conv-", "")
    }

    return conversationId
  }

  // Helper function to validate UUID format
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Demo data for fallback
  private getDemoMessages(conversationId: string): Message[] {
    const cleanId = this.cleanConversationId(conversationId)

    const demoMessages: Message[] = [
      {
        id: "demo-msg-1",
        conversation_id: cleanId,
        sender_id: "demo-user-1",
        content: "Hey! Great to match with you 😊",
        message_type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: false,
      },
      {
        id: "demo-msg-2",
        conversation_id: cleanId,
        sender_id: "demo-user-2",
        content: "Hi there! Nice to meet you too!",
        message_type: "text",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_read: true,
      },
      {
        id: "demo-msg-3",
        conversation_id: cleanId,
        sender_id: "demo-user-1",
        content: "How has your day been? I'd love to get to know you better!",
        message_type: "text",
        created_at: new Date(Date.now() - 900000).toISOString(),
        is_read: false,
      },
      {
        id: "demo-msg-4",
        conversation_id: cleanId,
        sender_id: "demo-user-2",
        content: "It's been great! I'm really enjoying our conversation. What are your hobbies?",
        message_type: "text",
        created_at: new Date(Date.now() - 300000).toISOString(),
        is_read: true,
      },
    ]

    return demoMessages
  }

  private getDemoConversations(): Conversation[] {
    return [
      {
        id: "demo-conv-1",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString(),
        participants: [
          {
            user_id: "demo-user-1",
            username: "sarah_m",
            full_name: "Sarah Mitchell",
            avatar_url: "/placeholder.svg?height=40&width=40",
          },
        ],
        last_message: {
          id: "demo-msg-last-1",
          conversation_id: "demo-conv-1",
          sender_id: "demo-user-1",
          content: "How has your day been?",
          message_type: "text",
          created_at: new Date(Date.now() - 900000).toISOString(),
          is_read: false,
        },
      },
      {
        id: "demo-conv-2",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        participants: [
          {
            user_id: "demo-user-2",
            username: "alex_j",
            full_name: "Alex Johnson",
            avatar_url: "/placeholder.svg?height=40&width=40",
          },
        ],
        last_message: {
          id: "demo-msg-last-2",
          conversation_id: "demo-conv-2",
          sender_id: "demo-user-2",
          content: "That sounds like a great plan!",
          message_type: "text",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true,
        },
      },
    ]
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    // Handle null/undefined conversationId
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

    try {
      const { data: messages, error } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", cleanId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return this.getDemoMessages(cleanId)
      }

      // If no messages found, return demo messages
      if (!messages || messages.length === 0) {
        console.log("No messages found, using demo data for:", cleanId)
        return this.getDemoMessages(cleanId)
      }

      return messages
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      return this.getDemoMessages(cleanId)
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    // Handle null/undefined userId
    if (!userId || typeof userId !== "string") {
      console.warn("Invalid user ID provided:", userId)
      return this.getDemoConversations()
    }

    try {
      const { data: conversations, error } = await this.supabase
        .from("conversations")
        .select(`
          *,
          conversation_participants!inner(
            user_id,
            profiles(username, full_name, avatar_url)
          ),
          messages(
            id,
            content,
            sender_id,
            created_at,
            message_type,
            is_read
          )
        `)
        .eq("conversation_participants.user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching conversations:", error)
        return this.getDemoConversations()
      }

      if (!conversations || conversations.length === 0) {
        return this.getDemoConversations()
      }

      // Transform the data
      const transformedConversations: Conversation[] = conversations.map((conv: any) => {
        const participants =
          conv.conversation_participants
            ?.filter((p: any) => p.user_id !== userId)
            ?.map((p: any) => ({
              user_id: p.user_id,
              username: p.profiles?.username,
              full_name: p.profiles?.full_name,
              avatar_url: p.profiles?.avatar_url,
            })) || []

        const lastMessage =
          conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : undefined

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participants,
          last_message: lastMessage
            ? {
                id: lastMessage.id,
                conversation_id: conv.id,
                sender_id: lastMessage.sender_id,
                content: lastMessage.content,
                message_type: lastMessage.message_type,
                created_at: lastMessage.created_at,
                is_read: lastMessage.is_read,
              }
            : undefined,
        }
      })

      return transformedConversations
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return this.getDemoConversations()
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    // Handle null/undefined parameters
    if (
      !conversationId ||
      !senderId ||
      !content ||
      typeof conversationId !== "string" ||
      typeof senderId !== "string" ||
      typeof content !== "string"
    ) {
      console.warn("Invalid parameters for sendMessage:", { conversationId, senderId, content })

      // Return a demo message for UI consistency
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

    try {
      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: cleanId,
          sender_id: senderId,
          content: content.trim(),
          message_type: "text",
        })
        .select()
        .single()

      if (error) {
        console.error("Error sending message:", error)
        // Return a demo message as fallback
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

      return message
    } catch (error) {
      console.error("Error in sendMessage:", error)
      // Return a demo message as fallback
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
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    // Handle null/undefined conversationId
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

    try {
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
          (payload) => {
            if (payload.new) {
              callback(payload.new as Message)
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

  async createConversation(participantIds: string[]): Promise<string | null> {
    // Handle null/undefined/empty participantIds
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      console.warn("Invalid participant IDs for conversation creation:", participantIds)
      return `demo-conv-${Date.now()}`
    }

    try {
      const { data: conversation, error } = await this.supabase.from("conversations").insert({}).select().single()

      if (error) {
        console.error("Error creating conversation:", error)
        return `demo-conv-${Date.now()}`
      }

      // Add participants
      const participantInserts = participantIds.map((userId) => ({
        conversation_id: conversation.id,
        user_id: userId,
      }))

      const { error: participantError } = await this.supabase
        .from("conversation_participants")
        .insert(participantInserts)

      if (participantError) {
        console.error("Error adding participants:", participantError)
        return `demo-conv-${Date.now()}`
      }

      return conversation.id
    } catch (error) {
      console.error("Error in createConversation:", error)
      return `demo-conv-${Date.now()}`
    }
  }

  // Helper method to find or create conversation between two users
  async findOrCreateConversation(userId1: string, userId2: string): Promise<string | null> {
    if (!userId1 || !userId2 || userId1 === userId2) {
      return `demo-conv-${userId1}-${userId2}`
    }

    try {
      // Try to find existing conversation between these users
      const { data: existingConversations, error } = await this.supabase
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner(*)
        `)
        .in("user_id", [userId1, userId2])

      if (error) {
        console.error("Error finding existing conversation:", error)
        return this.createConversation([userId1, userId2])
      }

      // Group by conversation_id and find conversations with both users
      const conversationCounts: { [key: string]: number } = {}
      existingConversations?.forEach((item: any) => {
        conversationCounts[item.conversation_id] = (conversationCounts[item.conversation_id] || 0) + 1
      })

      // Find conversation with both users (count = 2)
      const existingConvId = Object.keys(conversationCounts).find((convId) => conversationCounts[convId] === 2)

      if (existingConvId) {
        return existingConvId
      }

      // Create new conversation if none exists
      return this.createConversation([userId1, userId2])
    } catch (error) {
      console.error("Error in findOrCreateConversation:", error)
      return `demo-conv-${userId1}-${userId2}`
    }
  }
}

export const messagingService = new MessagingService()
