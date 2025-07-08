"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { messagingService, type Message } from "@/lib/messaging-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MessageThreadProps {
  conversationId: string
  otherUser?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

export function MessageThread({ conversationId, otherUser }: MessageThreadProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      try {
        const conversationMessages = await messagingService.getConversationMessages(conversationId)
        setMessages(conversationMessages)
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = messagingService.subscribeToMessages(conversationId, (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      const message = await messagingService.sendMessage(conversationId, user.id, newMessage.trim())
      if (message) {
        setMessages((prev) => [...prev, message])
        setNewMessage("")
      }
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
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true

    const currentDate = new Date(currentMessage.created_at).toDateString()
    const previousDate = new Date(previousMessage.created_at).toDateString()

    return currentDate !== previousDate
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600">Please log in to view messages.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-slate-50 dark:bg-slate-800 rounded-t-lg">
        <Button variant="ghost" size="sm" asChild className="md:hidden">
          <Link href="/messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {otherUser && (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} alt={otherUser.full_name} />
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                {otherUser.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{otherUser.full_name}</h3>
              <p className="text-sm text-slate-500">@{otherUser.username}</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500 mb-2">No messages yet</p>
              <p className="text-sm text-slate-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : undefined
              const showDateSeparator = shouldShowDateSeparator(message, previousMessage)
              const isCurrentUser = message.sender_id === user.id

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-500">
                        {formatMessageDate(message.created_at)}
                      </div>
                    </div>
                  )}

                  <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage
                            src={message.sender?.avatar_url || "/placeholder.svg"}
                            alt={message.sender?.full_name || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs">
                            {(message.sender?.full_name || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                        <Card
                          className={`${
                            isCurrentUser
                              ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-0"
                              : "bg-slate-100 dark:bg-slate-700"
                          }`}
                        >
                          <CardContent className="p-3">
                            <p className="text-sm">{message.content}</p>
                          </CardContent>
                        </Card>
                        <span className="text-xs text-slate-400 mt-1">{formatMessageTime(message.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-slate-50 dark:bg-slate-800 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
