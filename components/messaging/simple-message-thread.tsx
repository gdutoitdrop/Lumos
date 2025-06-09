"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface MessageThreadProps {
  conversationId: string
  matchId: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  message_text: string
  sent_at: string
  is_read: boolean
}

export function SimpleMessageThread({ conversationId, matchId }: MessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId || !user) {
        setLoading(false)
        return
      }

      try {
        const { data: messagesData } = await supabase
          .from("user_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("sent_at", { ascending: true })

        setMessages(messagesData || [])
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
          table: "user_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [conversationId, supabase, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!user || !conversationId || !newMessage.trim()) return

    setSending(true)

    try {
      await supabase.from("user_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: matchId,
        message_text: newMessage.trim(),
        is_read: false,
      })

      setNewMessage("")

      // Update conversation timestamp
      await supabase
        .from("user_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
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
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => (window.location.href = "/messages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-medium text-slate-800 dark:text-white">Conversation</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">ID: {conversationId.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-3 max-w-[80%]`}>
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
                    <p className="text-sm leading-relaxed">{message.message_text}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {formatMessageTime(message.sent_at)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[60px] max-h-[120px] resize-none"
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
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white h-12 w-12 rounded-xl shadow-md flex-shrink-0"
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
