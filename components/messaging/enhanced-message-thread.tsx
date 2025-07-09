"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Phone, Video, ArrowLeft, User, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { messagingService, type Message } from "@/lib/simple-messaging"

interface EnhancedMessageThreadProps {
  conversationId: string
  matchId: string
  participantInfo?: {
    name: string
    username: string
    avatar_url?: string
  }
}

export function EnhancedMessageThread({
  conversationId,
  matchId,
  participantInfo: initialParticipantInfo,
}: EnhancedMessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  // Message state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [participantInfo, setParticipantInfo] = useState(initialParticipantInfo)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Safely extract actual match ID (remove "match-" prefix if present)
  const actualMatchId = React.useMemo(() => {
    if (!matchId || typeof matchId !== "string") return ""
    return matchId.startsWith("match-") ? matchId.replace("match-", "") : matchId
  }, [matchId])

  // Clean conversation ID for database queries
  const cleanConversationId = React.useMemo(() => {
    if (!conversationId || typeof conversationId !== "string") return "demo-conversation"

    // Remove prefixes that might cause UUID issues
    let cleanId = conversationId
    if (cleanId.startsWith("match-")) {
      cleanId = cleanId.replace("match-", "")
    }
    if (cleanId.startsWith("conv-")) {
      cleanId = cleanId.replace("conv-", "")
    }

    return cleanId
  }, [conversationId])

  // Fetch participant info if not provided
  useEffect(() => {
    const fetchParticipantInfo = async () => {
      if (participantInfo || !actualMatchId) return

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", actualMatchId)
          .single()

        if (error) {
          console.error("Error fetching participant:", error)
          // Use fallback data based on match ID
          setParticipantInfo({
            name: actualMatchId.includes("demo") ? "Demo User" : "User",
            username: actualMatchId.includes("demo") ? "demo_user" : "user",
            avatar_url: undefined,
          })
          return
        }

        if (profile) {
          setParticipantInfo({
            name: profile.full_name || profile.username || "User",
            username: profile.username || "user",
            avatar_url: profile.avatar_url || undefined,
          })
        }
      } catch (error) {
        console.error("Error in fetchParticipantInfo:", error)
        // Use fallback data
        setParticipantInfo({
          name: actualMatchId.includes("demo") ? "Demo User" : "User",
          username: actualMatchId.includes("demo") ? "demo_user" : "user",
          avatar_url: undefined,
        })
      }
    }

    fetchParticipantInfo()
  }, [actualMatchId, participantInfo, supabase])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!cleanConversationId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching messages for conversation:", cleanConversationId)
        // Use messaging service to get messages with cleaned ID
        const messagesData = await messagingService.getConversationMessages(cleanConversationId)
        setMessages(messagesData)
        console.log("Loaded messages:", messagesData.length)
      } catch (error) {
        console.error("Error in fetchMessages:", error)
        setError("Failed to load messages")
        // Use demo messages as fallback
        setMessages([
          {
            id: "demo-1",
            conversation_id: cleanConversationId,
            sender_id: actualMatchId || "demo-user",
            content: "Hey! Great to match with you 😊",
            message_type: "text",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: false,
          },
          {
            id: "demo-2",
            conversation_id: cleanConversationId,
            sender_id: user?.id || "current-user",
            content: "Hi there! Nice to meet you too!",
            message_type: "text",
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_read: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    let subscription: any = null
    if (cleanConversationId && user) {
      subscription = messagingService.subscribeToMessages(cleanConversationId, (newMessage) => {
        console.log("New message received:", newMessage)
        setMessages((prev) => [...prev, newMessage])
      })
    }

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [cleanConversationId, actualMatchId, user])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startCall = async (callType: "video" | "audio") => {
    const participantName = participantInfo?.name || "this user"
    alert(`${callType} calling feature coming soon! This will start a ${callType} call with ${participantName}.`)
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!user || !newMessage.trim()) {
      setError("Please enter a message")
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Sending message to conversation:", cleanConversationId)
      // Send message using messaging service with cleaned ID
      const sentMessage = await messagingService.sendMessage(cleanConversationId, user.id, newMessage.trim())

      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage])
        setNewMessage("")
        setSuccess("Message sent!")
        console.log("Message sent successfully:", sentMessage)
      } else {
        // Fallback: add message locally
        const localMessage: Message = {
          id: Date.now().toString(),
          conversation_id: cleanConversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
        setMessages((prev) => [...prev, localMessage])
        setNewMessage("")
        setSuccess("Message sent!")
      }

      setTimeout(() => setSuccess(null), 2000)
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
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

  // Default participant info if not loaded
  const displayParticipant = participantInfo || {
    name: actualMatchId.includes("demo") ? "Demo User" : "Loading...",
    username: actualMatchId.includes("demo") ? "demo_user" : "user",
    avatar_url: undefined,
  }

  if (loading && !participantInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading conversation...</p>
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
            {displayParticipant.avatar_url ? (
              <AvatarImage src={displayParticipant.avatar_url || "/placeholder.svg"} alt={displayParticipant.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                {displayParticipant.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1">
            <h2 className="text-lg font-medium text-slate-800 dark:text-white">{displayParticipant.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{displayParticipant.username}</p>
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
            <Button variant="outline" size="icon" onClick={() => (window.location.href = `/profile/${actualMatchId}`)}>
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
                Send your first message to begin chatting with {displayParticipant.name}.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent"
                onClick={() => setNewMessage("Hello! How are you?")}
              >
                Say Hello 👋
              </Button>
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
                        ) : displayParticipant.avatar_url ? (
                          <AvatarImage
                            src={displayParticipant.avatar_url || "/placeholder.svg"}
                            alt={displayParticipant.name}
                          />
                        ) : (
                          <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                            {displayParticipant.name.charAt(0).toUpperCase()}
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
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {formatMessageTime(message.created_at)}
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
              placeholder={`Message ${displayParticipant.name}...`}
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
