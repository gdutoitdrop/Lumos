"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MessageThreadProps {
  conversationId: string
}

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  current_mood: string | null
  location: string | null
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  profile_id: string | null
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [participant, setParticipant] = useState<Profile | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get the current user's profile ID
  useEffect(() => {
    const getProfileId = async () => {
      if (!user) return

      try {
        // Try auth_id first
        let { data, error } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single()

        if (error || !data) {
          // Try direct ID match
          const { data: directData, error: directError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single()

          if (!directError && directData) {
            data = directData
          }
        }

        if (data) {
          setProfileId(data.id)
        } else {
          console.warn("Could not find profile for user:", user.id)
        }
      } catch (err) {
        console.error("Error in getProfileId:", err)
      }
    }

    getProfileId()
  }, [user, supabase])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !conversationId) return

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching messages for conversation:", conversationId)

        // Get all messages in the conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("Error fetching messages:", messagesError)
          setError("Could not load messages. Please try again.")
          return
        }

        console.log("Messages data:", messagesData)

        // Get conversation participants
        const { data: participants, error: participantsError } = await supabase
          .from("conversation_participants")
          .select("user_id, profile_id")
          .eq("conversation_id", conversationId)

        if (participantsError) {
          console.error("Error fetching participants:", participantsError)
          setError("Could not load conversation participants.")
          return
        }

        console.log("Participants data:", participants)

        // Find the other participant
        const otherParticipant = participants?.find(
          (p) => p.user_id !== user.id && (profileId ? p.profile_id !== profileId : true),
        )

        if (otherParticipant) {
          // Get the other participant's profile
          const profileIdToFetch = otherParticipant.profile_id || otherParticipant.user_id

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profileIdToFetch)
            .single()

          if (!profileError && profile) {
            setParticipant(profile)
          }
        }

        // Get sender profiles for all messages
        const senderIds = [...new Set(messagesData.map((m) => m.profile_id || m.sender_id).filter(Boolean))]

        if (senderIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", senderIds)

          if (!profilesError && profiles) {
            // Combine messages with sender profiles
            const messagesWithSenders = messagesData.map((message) => {
              const senderId = message.profile_id || message.sender_id
              const sender = profiles.find((p) => p.id === senderId)
              return { ...message, sender }
            })

            setMessages(messagesWithSenders)
          } else {
            setMessages(messagesData)
          }
        } else {
          setMessages(messagesData)
        }

        // Mark unread messages as read
        const unreadMessages = messagesData.filter(
          (m) => !m.is_read && m.sender_id !== user.id && m.profile_id !== profileId,
        )

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map((message) => supabase.from("messages").update({ is_read: true }).eq("id", message.id)),
          )
        }
      } catch (error) {
        console.error("Error in fetchMessages:", error)
        setError("An unexpected error occurred.")
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
          const senderId = newMessage.profile_id || newMessage.sender_id
          if (senderId) {
            const { data: sender } = await supabase.from("profiles").select("*").eq("id", senderId).single()

            // Add the new message to the state
            setMessages((prev) => [...prev, { ...newMessage, sender }])

            // Mark as read if not from current user
            if (newMessage.sender_id !== user.id && newMessage.profile_id !== profileId) {
              await supabase.from("messages").update({ is_read: true }).eq("id", newMessage.id)
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [user, conversationId, supabase, profileId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!user || !conversationId || !newMessage.trim()) return

    setSending(true)
    setError(null)

    try {
      const messageData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
      }

      // Add profile_id if we have it
      if (profileId) {
        messageData.profile_id = profileId
      }

      console.log("Sending message:", messageData)

      const { error } = await supabase.from("messages").insert(messageData)

      if (error) {
        console.error("Error sending message:", error)
        setError("Failed to send message. Please try again.")
        return
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      setError("An unexpected error occurred.")
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
    const groups: { date: string; messages: Message[] }[] = []

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

  const viewProfile = () => {
    if (participant) {
      window.location.href = `/profile/${participant.id}`
    }
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
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={participant.avatar_url || ""} alt={participant.username || ""} />
              <AvatarFallback>{(participant.full_name || participant.username || "U").charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">{participant.full_name || participant.username}</h2>
              {participant.current_mood && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{participant.current_mood}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={viewProfile}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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

              {group.messages.map((message) => {
                const isCurrentUser = message.sender_id === user.id || (profileId && message.profile_id === profileId)

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[80%]`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url || ""} alt={message.sender?.username || ""} />
                          <AvatarFallback>
                            {(message.sender?.full_name || message.sender?.username || "U").charAt(0)}
                          </AvatarFallback>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
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
