"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]

interface MessageThreadProps {
  conversationId: string
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [participant, setParticipant] = useState<Profile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !conversationId) return

      setLoading(true)

      try {
        // Get all messages in the conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (messagesError) throw messagesError

        // Get the other participant
        const { data: participants, error: participantsError } = await supabase
          .from("conversation_participants")
          .select("profile_id")
          .eq("conversation_id", conversationId)
          .neq("profile_id", user.id)

        if (participantsError) throw participantsError

        if (participants.length > 0) {
          const otherParticipantId = participants[0].profile_id

          // Get the other participant's profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherParticipantId)
            .single()

          if (profileError) throw profileError

          setParticipant(profile)
        }

        // Get all senders' profiles
        const senderIds = [...new Set(messagesData.map((m) => m.profile_id))]
        const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", senderIds)

        if (profilesError) throw profilesError

        // Combine messages with sender profiles
        const messagesWithSenders = messagesData.map((message) => {
          const sender = profiles.find((p) => p.id === message.profile_id)
          return { ...message, sender: sender! }
        })

        setMessages(messagesWithSenders)

        // Mark unread messages as read
        const unreadMessages = messagesData.filter((m) => !m.is_read && m.profile_id !== user.id)

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map((message) => supabase.from("messages").update({ is_read: true }).eq("id", message.id)),
          )
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          // Get the sender's profile
          const { data: sender, error: senderError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMessage.profile_id)
            .single()

          if (senderError) {
            console.error("Error fetching sender:", senderError)
            return
          }

          // Add the new message to the state
          setMessages((prev) => [...prev, { ...newMessage, sender }])

          // Mark the message as read if it's not from the current user
          if (newMessage.profile_id !== user.id) {
            await supabase.from("messages").update({ is_read: true }).eq("id", newMessage.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [user, conversationId, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!user || !conversationId || !newMessage.trim()) return

    setSending(true)

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        profile_id: user.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: (Message & { sender: Profile })[] }[] = []

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.created_at)
      const existingGroup = groups.find((group) => group.date === messageDate)

      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        })
      }
    })

    return groups
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {participant && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={participant.avatar_url || ""} alt={participant.username || ""} />
            <AvatarFallback>{participant.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{participant.full_name || participant.username}</h2>
            {participant.current_mood && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{participant.current_mood}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <div className="flex justify-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {group.date}
                </span>
              </div>

              {group.messages.map((message, messageIndex) => {
                const isCurrentUser = message.profile_id === user?.id

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[80%]`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.avatar_url || ""} alt={message.sender.username || ""} />
                          <AvatarFallback>{message.sender.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? "bg-rose-500 text-white rounded-br-none"
                            : "bg-slate-200 dark:bg-slate-700 rounded-bl-none"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"}`}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <Button type="submit" size="icon" />
          <Button
            type="submit"
            size="icon"
            className="bg-rose-500 text-white h-10 w-10"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
