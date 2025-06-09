"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MessageThreadProps {
  conversationId: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching messages for conversation:", conversationId)

        // First verify the conversation exists
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .eq("id", conversationId)
          .single()

        if (convError) {
          console.error("Conversation not found:", convError)
          setError("Conversation not found. Please try creating a new conversation.")
          return
        }

        // Fetch messages for this conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("id, conversation_id, sender_id, content, is_read, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("Error fetching messages:", messagesError)
          setError(`Could not load messages: ${messagesError.message}`)
          return
        }

        console.log("Messages loaded:", messagesData)
        setMessages(messagesData || [])
      } catch (error) {
        console.error("Error in fetchMessages:", error)
        setError("An unexpected error occurred while loading messages.")
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
        (payload) => {
          console.log("New message received:", payload.new)
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!user || !conversationId || !newMessage.trim()) {
      setError("Please enter a message")
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Sending message:", {
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage.trim(),
      })

      // First verify user is a participant in this conversation
      const { data: participant, error: participantError } = await supabase
        .from("conversation_participants")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .single()

      if (participantError || !participant) {
        console.error("User not a participant:", participantError)
        setError("You are not a participant in this conversation.")
        return
      }

      // Send the message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          is_read: false,
        })
        .select("id, conversation_id, sender_id, content, is_read, created_at")
        .single()

      if (error) {
        console.error("Error sending message:", error)
        setError(`Failed to send message: ${error.message}`)
        return
      }

      console.log("Message sent successfully:", data)
      setNewMessage("")
      setSuccess("Message sent!")

      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000)
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      setError("An unexpected error occurred while sending the message.")
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Conversation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">ID: {conversationId.slice(0, 8)}...</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Send className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Start the conversation!</h3>
              <p className="text-slate-500 dark:text-slate-400">Send your first message to begin chatting.</p>
            </div>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              {/* Date separator */}
              <div className="flex justify-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>

              {/* Messages for this date */}
              {group.messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-3 max-w-[80%]`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback
                          className={
                            isCurrentUser
                              ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700"
                          }
                        >
                          {isCurrentUser ? "You" : "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isCurrentUser
                            ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-br-md"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"
                          }`}
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

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[60px] max-h-[120px] resize-none border-slate-300 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={sending}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white h-12 w-12 rounded-xl shadow-md"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {sending ? "Sending message..." : "Press Enter to send, Shift+Enter for new line"}
        </p>
      </div>
    </div>
  )
}
