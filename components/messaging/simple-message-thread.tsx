"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, Video } from "lucide-react"
import { messagingService, type Message } from "@/lib/simple-messaging"

interface MessageThreadProps {
  conversationId: string
  userId: string
}

export function SimpleMessageThread({ conversationId, userId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

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

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await messagingService.getConversationMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      const message = await messagingService.sendMessage(conversationId, userId, newMessage.trim())

      if (message) {
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">TU</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">Test User</h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="hover:bg-rose-50 bg-transparent">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="hover:bg-rose-50 bg-transparent">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === userId
            const senderName = message.sender?.full_name || message.sender?.username || "Unknown"
            const initials = senderName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={`text-white text-xs ${
                        isOwn
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gradient-to-r from-rose-500 to-amber-500"
                      }`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Card
                    className={`${
                      isOwn ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-white border-gray-200"
                    }`}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
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
            className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
