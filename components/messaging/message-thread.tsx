"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Phone, Video, MoreVertical, PhoneCall } from "lucide-react"
import { messagingService, type Message, type Conversation } from "@/lib/messaging-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MessageThreadProps {
  conversationId: string
  onStartCall?: (userId: string, callType: "audio" | "video") => void
}

export function MessageThread({ conversationId, onStartCall }: MessageThreadProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId || !user) return

    const fetchData = async () => {
      try {
        setError(null)
        setLoading(true)

        console.log("Fetching data for conversation:", conversationId)

        // Fetch conversation details
        const conversations = await messagingService.getUserConversations(user.id)
        const currentConversation = conversations.find((c) => c.id === conversationId)
        console.log("Found conversation:", currentConversation)
        setConversation(currentConversation || null)

        // Fetch messages
        const messages = await messagingService.getConversationMessages(conversationId)
        console.log("Fetched messages:", messages)
        setMessages(messages)
      } catch (error) {
        console.error("Error fetching conversation data:", error)
        setError("Failed to load conversation")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to new messages
    const subscription = messagingService.subscribeToConversation(conversationId, (message) => {
      console.log("Received new message:", message)
      setMessages((prev) => [...prev, message])
    })

    return () => {
      console.log("Unsubscribing from conversation")
      subscription.unsubscribe()
    }
  }, [conversationId, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!user || !conversationId || !newMessage.trim()) {
      console.log("Cannot send message - missing data")
      return
    }

    setSending(true)
    setError(null)

    try {
      console.log("Sending message...")
      await messagingService.sendMessage(conversationId, user.id, newMessage.trim())
      setNewMessage("")
      console.log("Message sent successfully")
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
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
      return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    }
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

  const getOtherParticipant = () => {
    if (!conversation) return null
    return conversation.participants.find((p) => p.user_id !== user?.id)
  }

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender_id === user?.id

    if (message.message_type === "call_start" || message.message_type === "call_end") {
      return (
        <div key={message.id} className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-700 rounded-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 flex items-center">
            <PhoneCall className="h-4 w-4 mr-2" />
            {message.content}
          </div>
        </div>
      )
    }

    return (
      <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
        <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-3 max-w-[80%]`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={message.sender_profile?.avatar_url || "/placeholder.svg"}
              alt={message.sender_profile?.full_name || "User"}
            />
            <AvatarFallback
              className={
                isCurrentUser
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700"
              }
            >
              {isCurrentUser
                ? user?.user_metadata?.full_name?.charAt(0) || "Y"
                : message.sender_profile?.full_name?.charAt(0) || "U"}
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
            <p className={`text-xs mt-2 ${isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"}`}>
              {formatMessageTime(message.created_at)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const otherParticipant = getOtherParticipant()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Conversation not found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            This conversation may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherParticipant?.profile?.avatar_url || "/placeholder.svg"}
                alt={otherParticipant?.profile?.full_name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                {otherParticipant?.profile?.full_name?.charAt(0) ||
                  otherParticipant?.profile?.username?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium text-slate-800 dark:text-white">
                {otherParticipant?.profile?.full_name || otherParticipant?.profile?.username || "Test User"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                @{otherParticipant?.profile?.username || "testuser"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onStartCall && otherParticipant && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStartCall(otherParticipant.user_id, "audio")}
                  className="hover:bg-green-50 hover:border-green-300"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStartCall(otherParticipant.user_id, "video")}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
              {group.messages.map(renderMessage)}
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
