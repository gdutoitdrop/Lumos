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

export interface Profile {
  id: string
  username: string
  full_name: string
  bio?: string
  avatar_url?: string
  mental_health_badges?: string[]
  current_mood?: string
  looking_for?: string
  mental_health_journey?: string
  gender?: string
  age?: number
  location?: string
  created_at: string
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants: Array<{
    user_id: string
    profiles: {
      username: string
      full_name: string
      avatar_url?: string
    }
  }>
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

  // Helper function to validate UUID format
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Demo data generators
  private getDemoProfile(userId: string): Profile {
    const demoProfiles: { [key: string]: Profile } = {
      "demo-user-1": {
        id: "demo-user-1",
        username: "sarah_j",
        full_name: "Sarah Johnson",
        bio: "Love hiking and coffee ☕ Always here to listen and support others on their mental health journey.",
        avatar_url: "/placeholder.svg?height=100&width=100",
        mental_health_badges: ["Anxiety Warrior", "Mental Health Advocate"],
        current_mood: "Feeling hopeful today",
        age: 28,
        location: "San Francisco, CA",
        created_at: new Date().toISOString(),
      },
      "demo-user-2": {
        id: "demo-user-2",
        username: "mike_chen",
        full_name: "Mike Chen",
        bio: "Photographer and traveler 📸 Passionate about mindfulness and helping others find peace.",
        avatar_url: "/placeholder.svg?height=100&width=100",
        mental_health_badges: ["Depression Fighter", "Mindfulness Practitioner"],
        current_mood: "Grateful and centered",
        age: 32,
        location: "Los Angeles, CA",
        created_at: new Date().toISOString(),
      },
    }

    return (
      demoProfiles[userId] || {
        id: userId,
        username: "demo_user",
        full_name: "Demo User",
        bio: "This is a demo profile for testing purposes.",
        created_at: new Date().toISOString(),
      }
    )
  }

  private getDemoMessages(conversationId: string): Message[] {
    return [
      {
        id: "demo-msg-1",
        conversation_id: conversationId,
        sender_id: "demo-user-1",
        content: "Hey! Great to match with you 😊 How are you doing today?",
        message_type: "text",
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        is_read: true,
      },
      {
        id: "demo-msg-2",
        conversation_id: conversationId,
        sender_id: "current-user",
        content: "Hi Sarah! I'm doing well, thanks for asking. I really appreciate your positive energy!",
        message_type: "text",
        created_at: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
        is_read: true,
      },
      {
        id: "demo-msg-3",
        conversation_id: conversationId,
        sender_id: "demo-user-1",
        content:
          "That's wonderful to hear! I love connecting with people who share similar values around mental health and wellness.",
        message_type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        is_read: true,
      },
      {
        id: "demo-msg-4",
        conversation_id: conversationId,
        sender_id: "current-user",
        content:
          "I saw in your profile that you're into hiking. I've been trying to get more into outdoor activities for my mental health.",
        message_type: "text",
        created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        is_read: true,
      },
      {
        id: "demo-msg-5",
        conversation_id: conversationId,
        sender_id: "demo-user-1",
        content:
          "That's amazing! Nature has such a healing effect. There's this beautiful trail I love - maybe we could check it out together sometime? 🥾",
        message_type: "text",
        created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        is_read: false,
      },
    ]
  }

  private getDemoConversations(userId: string): Conversation[] {
    return [
      {
        id: "demo-conv-1",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 600000).toISOString(),
        participants: [
          {
            user_id: "demo-user-1",
            profiles: {
              username: "sarah_j",
              full_name: "Sarah Johnson",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
          },
        ],
        other_user: {
          id: "demo-user-1",
          name: "Sarah Johnson",
          username: "sarah_j",
          avatar_url: "/placeholder.svg?height=50&width=50",
        },
        last_message: {
          id: "demo-msg-last-1",
          conversation_id: "demo-conv-1",
          sender_id: "demo-user-1",
          content:
            "That's amazing! Nature has such a healing effect. There's this beautiful trail I love - maybe we could check it out together sometime? 🥾",
          message_type: "text",
          created_at: new Date(Date.now() - 600000).toISOString(),
          is_read: false,
        },
        unread_count: 1,
      },
      {
        id: "demo-conv-2",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        participants: [
          {
            user_id: "demo-user-2",
            profiles: {
              username: "mike_chen",
              full_name: "Mike Chen",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
          },
        ],
        other_user: {
          id: "demo-user-2",
          name: "Mike Chen",
          username: "mike_chen",
          avatar_url: "/placeholder.svg?height=50&width=50",
        },
        last_message: {
          id: "demo-msg-last-2",
          conversation_id: "demo-conv-2",
          sender_id: userId,
          content: "Thanks for sharing those mindfulness tips! They've been really helpful.",
          message_type: "text",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true,
        },
        unread_count: 0,
      },
    ]
  }

  async getProfile(userId: string): Promise<Profile | null> {
    if (!userId || typeof userId !== "string") {
      return null
    }

    // Return demo profile for demo users
    if (userId.startsWith("demo-") || !this.isValidUUID(userId)) {
      return this.getDemoProfile(userId)
    }

    try {
      const { data: profile, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return this.getDemoProfile(userId)
      }

      return profile
    } catch (error) {
      console.error("Error in getProfile:", error)
      return this.getDemoProfile(userId)
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    if (!userId || typeof userId !== "string") {
      return this.getDemoConversations("demo-user")
    }

    // Return demo conversations for demo users or invalid UUIDs
    if (userId.startsWith("demo-") || !this.isValidUUID(userId)) {
      return this.getDemoConversations(userId)
    }

    try {
      // Get conversations where user is a participant
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
        return this.getDemoConversations(userId)
      }

      if (!participantData || participantData.length === 0) {
        return this.getDemoConversations(userId)
      }

      const conversationIds = participantData.map((p: any) => p.conversation_id)

      // Get other participants for each conversation
      const conversationsWithUsers = await Promise.all(
        participantData.map(async (convData: any) => {
          const conversation = convData.conversations

          // Get other participants
          const { data: otherParticipants } = await this.supabase
            .from("conversation_participants")
            .select(`
              user_id,
              profiles!inner(
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("conversation_id", conversation.id)
            .neq("user_id", userId)
            .limit(1)

          // Get last message
          const { data: lastMessage } = await this.supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: false })
            .limit(1)

          // Get unread count
          const { count: unreadCount } = await this.supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversation.id)
            .eq("is_read", false)
            .neq("sender_id", userId)

          const otherUser = otherParticipants?.[0]

          return {
            ...conversation,
            participants: otherParticipants || [],
            other_user: otherUser
              ? {
                  id: otherUser.user_id,
                  name: otherUser.profiles.full_name || otherUser.profiles.username,
                  username: otherUser.profiles.username,
                  avatar_url: otherUser.profiles.avatar_url,
                }
              : undefined,
            last_message: lastMessage?.[0],
            unread_count: unreadCount || 0,
          }
        }),
      )

      return conversationsWithUsers.filter((conv) => conv.other_user)
    } catch (error) {
      console.error("Error in getUserConversations:", error)
      return this.getDemoConversations(userId)
    }
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    if (!conversationId || typeof conversationId !== "string") {
      return this.getDemoMessages("demo-conversation")
    }

    // Return demo messages for demo conversations or invalid UUIDs
    if (conversationId.startsWith("demo-") || !this.isValidUUID(conversationId)) {
      return this.getDemoMessages(conversationId)
    }

    try {
      const { data: messages, error } = await this.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
        return this.getDemoMessages(conversationId)
      }

      if (!messages || messages.length === 0) {
        return this.getDemoMessages(conversationId)
      }

      return messages
    } catch (error) {
      console.error("Error in getConversationMessages:", error)
      return this.getDemoMessages(conversationId)
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    if (!conversationId || !senderId || !content || typeof content !== "string") {
      return null
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return null
    }

    // For demo conversations or invalid UUIDs, return demo message
    if (conversationId.startsWith("demo-") || !this.isValidUUID(conversationId)) {
      return {
        id: `demo-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmedContent,
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: false,
      }
    }

    try {
      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: trimmedContent,
          message_type: "text",
        })
        .select()
        .single()

      if (error) {
        console.error("Error sending message:", error)
        // Return demo message as fallback
        return {
          id: `demo-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: senderId,
          content: trimmedContent,
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
      }

      // Update conversation timestamp
      await this.supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

      return message
    } catch (error) {
      console.error("Error in sendMessage:", error)
      return {
        id: `demo-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmedContent,
        message_type: "text",
        created_at: new Date().toISOString(),
        is_read: false,
      }
    }
  }

  async createConversation(participantIds: string[]): Promise<string | null> {
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return `demo-conv-${Date.now()}`
    }

    // For demo users, return demo conversation ID
    if (participantIds.some((id) => id.startsWith("demo-") || !this.isValidUUID(id))) {
      return `demo-conv-${participantIds.join("-")}`
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

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    if (!conversationId || typeof conversationId !== "string") {
      return { unsubscribe: () => {} }
    }

    // Don't subscribe to demo conversations
    if (conversationId.startsWith("demo-") || !this.isValidUUID(conversationId)) {
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

  async sendCallSignal(signalData: {
    call_id: string
    signal_type: string
    from_user_id: string
    to_user_id: string
    call_type: string
    signal_data?: any
  }): Promise<void> {
    try {
      const { error } = await this.supabase.from("call_signals").insert(signalData)

      if (error) {
        console.error("Error sending call signal:", error)
      }
    } catch (error) {
      console.error("Error in sendCallSignal:", error)
    }
  }

  subscribeToCallSignals(userId: string, callback: (signal: any) => void) {
    if (!userId || !this.isValidUUID(userId)) {
      return { unsubscribe: () => {} }
    }

    try {
      const subscription = this.supabase
        .channel(`call_signals:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "call_signals",
            filter: `to_user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new) {
              callback(payload.new)
            }
          },
        )
        .subscribe()

      return subscription
    } catch (error) {
      console.error("Error subscribing to call signals:", error)
      return { unsubscribe: () => {} }
    }
  }
}

export const messagingService = new MessagingService()
