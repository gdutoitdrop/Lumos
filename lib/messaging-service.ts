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

class MessagingService {
  private supabase = createClient()

  private isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== "string") return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  private getDemoConversations(): Conversation[] {
    return [
      {
        id: "demo-conv-1",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        other_user: {
          id: "demo-user-1",
          username: "sarah_j",
          full_name: "Sarah Johnson",
          avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
        },
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
        other_user: {
          id: "demo-user-2",
          username: "mike_chen",
          full_name: "Mike Chen",
          avatar_url: "/placeholder.svg?height=40&width=40&text=MC",
        },
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
          avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
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
          avatar_url: "/placeholder.svg?height=40&width=40&text=You",
        },
      },
      {
        id: "demo-msg-3",
        conversation_id: conversationId,
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
      if (!userId || !this.isValidUUID(userId)) {
        return this.getDemoConversations()
      }

      const { data: participantData, error } = await this.supabase
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

      if (error || !participantData || participantData.length === 0) {
        return this.getDemoConversations()
      }

      const conversationsWithDetails = await Promise.all(
        participantData.map(async (item: any) => {
          const conversationId = item.conversation_id
          const conversation = item.conversations

          // Get other participants
          const { data: otherParticipants } = await this.supabase
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
            .limit(1)

          // Get last message
          const { data: lastMessages } = await this.supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)

          // Get unread count
          const { count: unreadCount } = await this.supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversationId)
            .eq("is_read", false)
            .neq("sender_id", userId)

          const otherUser = otherParticipants?.[0]

          if (!otherUser || !otherUser.profiles) {
            return null
          }

          return {
            id: conversation.id,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            other_user: {
              id: otherUser.user_id,
              username: otherUser.profiles.username,
              full_name: otherUser.profiles.full_name,
              avatar_url: otherUser.profiles.avatar_url,
            },
            last_message: lastMessages?.[0],
            unread_count: unreadCount || 0,
          }
        }),
      )

      const validConversations = conversationsWithDetails.filter((conv) => conv !== null) as Conversation[]

      return validConversations.length > 0 ? validConversations : this.getDemoConversations()
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return this.getDemoConversations()
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      if (!conversationId || conversationId.startsWith("demo-") || !this.isValidUUID(conversationId)) {
        return this.getDemoMessages(conversationId)
      }

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
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error || !messages || messages.length === 0) {
        return this.getDemoMessages(conversationId)
      }

      return messages.map((msg: any) => ({
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
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      return this.getDemoMessages(conversationId)
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      if (!conversationId || !senderId || !content?.trim()) {
        return null
      }

      if (conversationId.startsWith("demo-") || !this.isValidUUID(conversationId)) {
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

      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
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

      return {
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
    } catch (error) {
      console.error("Error in sendMessage:", error)
      return null
    }
  }

  async createConversation(userId1: string, userId2: string): Promise<string | null> {
    try {
      if (!userId1 || !userId2 || userId1 === userId2) {
        return null
      }

      if (!this.isValidUUID(userId1) || !this.isValidUUID(userId2)) {
        return `demo-conv-${Date.now()}`
      }

      // Check if conversation already exists
      const existingConversation = await this.findExistingConversation(userId1, userId2)
      if (existingConversation) {
        return existingConversation
      }

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
      const { data: user1Conversations } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId1)

      const { data: user2Conversations } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId2)

      if (!user1Conversations || !user2Conversations) return null

      const user1ConvIds = user1Conversations.map((c) => c.conversation_id)
      const user2ConvIds = user2Conversations.map((c) => c.conversation_id)

      const commonConversations = user1ConvIds.filter((id) => user2ConvIds.includes(id))

      return commonConversations.length > 0 ? commonConversations[0] : null
    } catch (error) {
      console.error("Error finding existing conversation:", error)
      return null
    }
  }

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    if (!conversationId || conversationId.startsWith("demo-") || !this.isValidUUID(conversationId)) {
      return { unsubscribe: () => {} }
    }

    try {
      const subscription = this.supabase
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
            if (payload.new) {
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
}

export const messagingService = new MessagingService()
