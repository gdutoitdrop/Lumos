"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Phone, Video, ArrowLeft, User, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnhancedMessageThreadProps {
  conversationId: string
  matchId: string
  participantInfo: {
    name: string
    username: string
    avatar_url?: string
  }
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

export function EnhancedMessageThread({ conversationId, matchId, participantInfo }: EnhancedMessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  // Message state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return

      setLoading(true)
      setError(null)

      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("user_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("sent_at", { ascending: true })

        if (messagesError) {
          console.error("Error fetching messages:", messagesError)
          setError("Could not load messages.")
          return
        }

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
  }, [conversationId, supabase])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startCall = async (callType: "video" | "audio") => {
    // For now, just show an alert - we'll implement calling later
    alert(`${callType} calling feature coming soon! This will start a ${callType} call with ${participantInfo.name}.`)
  }

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
      const { data, error } = await supabase
        .from("user_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: matchId,
          message_text: newMessage.trim(),
          is_read: false,
        })
        .select()

      if (error) {
        console.error("Error sending message:", error)
        setError(`Failed to send message: ${error.message}`)
        return
      }

      setNewMessage("")
      setSuccess("Message sent!")

      // Update conversation timestamp
      await supabase
        .from("user_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)

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
      const messageDate = formatMessageDate(message.sent_at)
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => (window.location.href = "/messages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Avatar className="h-10 w-10">
            {participantInfo.avatar_url ? (
              <AvatarImage src={participantInfo.avatar_url || "/placeholder.svg"} alt={participantInfo.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                {participantInfo.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1">
            <h2 className="text-lg font-medium text-slate-800 dark:text-white">{participantInfo.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{participantInfo.username}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => startCall("audio")}
              className="hover:bg-green-50 hover:border-green-300"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => startCall("video")}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => (window.location.href = `/profile/${matchId}`)}>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
              <p className="text-slate-500 dark:text-slate-400">
                Send your first message or start a call to begin chatting.
              </p>
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
                        {isCurrentUser ? (
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            You
                          </AvatarFallback>
                        ) : participantInfo.avatar_url ? (
                          <AvatarImage
                            src={participantInfo.avatar_url || "/placeholder.svg"}
                            alt={participantInfo.name}
                          />
                        ) : (
                          <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                            {participantInfo.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <Card
                        className={`${
                          isCurrentUser
                            ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-none"
                            : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm leading-relaxed">{message.message_text}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {formatMessageTime(message.sent_at)}
                          </p>
                        </CardContent>
                      </Card>
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
              placeholder={`Message ${participantInfo.name}...`}
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
