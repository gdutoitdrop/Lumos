import { createClient } from "@/lib/supabase/client"

type RealtimeChannel = ReturnType<ReturnType<typeof createClient>["channel"]>

// Singleton pattern to manage Supabase realtime channels
export class RealtimeManager {
  private static instance: RealtimeManager
  private channels: Map<string, RealtimeChannel> = new Map()
  private supabase = createClient()

  private constructor() {}

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  // Subscribe to messages in a conversation
  public subscribeToMessages(conversationId: string, callback: (payload: any) => void): () => void {
    const channelKey = `messages:${conversationId}`

    if (this.channels.has(channelKey)) {
      return () => this.unsubscribe(channelKey)
    }

    const channel = this.supabase
      .channel(channelKey)
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

    this.channels.set(channelKey, channel)

    return () => this.unsubscribe(channelKey)
  }

  // Subscribe to new matches
  public subscribeToMatches(profileId: string, callback: (payload: any) => void): () => void {
    const channelKey = `matches:${profileId}`

    if (this.channels.has(channelKey)) {
      return () => this.unsubscribe(channelKey)
    }

    const channel = this.supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `profile_id_2=eq.${profileId}`,
        },
        callback,
      )
      .subscribe()

    this.channels.set(channelKey, channel)

    return () => this.unsubscribe(channelKey)
  }

  // Subscribe to forum thread updates
  public subscribeToThread(threadId: string, callback: (payload: any) => void): () => void {
    const channelKey = `thread:${threadId}`

    if (this.channels.has(channelKey)) {
      return () => this.unsubscribe(channelKey)
    }

    const channel = this.supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_replies",
          filter: `thread_id=eq.${threadId}`,
        },
        callback,
      )
      .subscribe()

    this.channels.set(channelKey, channel)

    return () => this.unsubscribe(channelKey)
  }

  // Unsubscribe from a channel
  private unsubscribe(channelKey: string): void {
    const channel = this.channels.get(channelKey)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelKey)
    }
  }

  // Unsubscribe from all channels
  public unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeManager = RealtimeManager.getInstance()
