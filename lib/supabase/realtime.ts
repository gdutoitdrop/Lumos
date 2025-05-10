"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function useRealtimeMessages(conversationId: string, callback: (message: any) => void) {
  const supabase = createClient()
  const [subscription, setSubscription] = useState<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    // Create a channel for this conversation
    const channel = supabase
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
          callback(payload.new)
        },
      )
      .subscribe()

    setSubscription(channel)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [conversationId, callback, supabase])

  return subscription
}

export function useRealtimePresence(conversationId: string) {
  const supabase = createClient()
  const [presence, setPresence] = useState<Record<string, any>>({})
  const [subscription, setSubscription] = useState<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      // Create a channel for presence
      const channel = supabase
        .channel(`presence:${conversationId}`)
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState()
          setPresence(state)
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("User joined:", key, newPresences)
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("User left:", key, leftPresences)
        })

      // Track user presence
      channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      })

      channel.subscribe()
      setSubscription(channel)
    })

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [conversationId, supabase])

  return presence
}
