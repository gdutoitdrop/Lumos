"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react"
import { messagingService, type Message } from "@/lib/simple-messaging"

interface MatchUser {
  id: string
  name: string
  username: string
  avatar_url?: string
  bio?: string
}

export default function MatchConversationPage() {
  const params = useParams()
  const matchId = params.id as string
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [matchUser, setMatchUser] = useState<MatchUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("Error getting user:", error)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error("Error in getUser:", error)
      }
    }

    getUser()
  }, [supabase])

  useEffect(() => {
    const loadMatchData = async () => {
      if (!user || !matchId) return

      setLoading(true)

      try {
        // Extract actual ID from match-{id} format
        const actualMatchId = matchId.replace("match-", "")

        // Try to get match user from profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, bio")
          .eq("id", actualMatchId)
          .single()

        if (profileError || !profileData) {
          console.error("Error fetching profile:", profileError)
          // Set demo match user
          setMatchUser({
            id: actualMatchId,
            name: "Sarah Johnson",
            username: "sarah_j",
            avatar_url: undefined,
            bio: "Love hiking and coffee ☕",
          })
        } else {
          setMatchUser({
            id: profileData.id,
            name: profileData.full_name || profileData.username || "Unknown User",
            username: profileData.username || "unknown",
            avatar_url: profileData.avatar_url,
            bio: profileData.bio,
          })
        }

        // Try to find existing conversation
        const userConversations = await messagingService.getUserConversations(user.id)
        const existingConversation = userConversations.find((conv) => conv.other_user?.id === actualMatchId)

        if (existingConversation) {
          setConversationId(existingConversation.id)
          const conversationMessages = await messagingService.getConversationMessages(existingConversation.id)
          setMessages(conversationMessages)
        } else {
          // No existing conversation, set demo messages
          setMessages([
            {
              id: "demo-msg-1",
              conversation_id: "demo-conv",
              sender_id: actualMatchId,
              content: "Hey! I saw we matched. How's your day going?",
              message_type: "text",
              created_at: new Date(Date.now() - 3600000).toISOString(),
              is_read: true,
            },
            {
              id: "demo-msg-2",
              conversation_id: "demo-conv",
              sender_id: user.id,
              content: "Hi there! It's going well, thanks for asking. I love your profile - we have a lot in common!",
              message_type: "text",
              created_at: new Date(Date.now() - 1800000).toISOString(),
              is_read: true,
            },
            {
              id: "demo-msg-3",
              conversation_id: "demo-conv",
              sender_id: actualMatchId,
              content: "That's awesome! I'd love to get to know you better. What are you passionate about?",
              message_type: "text",
              created_at: new Date().toISOString(),
              is_read: false,
            },
          ])
        }
      } catch (error) {
        console.error("Error loading match data:", error)
        // Set demo data on error
        setMatchUser({
          id: matchId.replace("match-", ""),
          name: "Sarah Johnson",
          username: "sarah_j",
          bio: "Love hiking and coffee ☕",
        })
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    loadMatchData()
  }, [user, matchId, supabase])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !matchUser || sending) return

    setSending(true)

    try {
      let currentConversationId = conversationId

      // Create conversation if it doesn't exist
      if (!currentConversationId) {
        currentConversationId = await messagingService.createConversation([user.id, matchUser.id])
        if (!currentConversationId) {
          console.error("Failed to create conversation")
          setSending(false)
          return
        }
        setConversationId(currentConversationId)
      }

      // Send message
      const sentMessage = await messagingService.sendMessage(currentConversationId, user.id, newMessage.trim())

      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage])
        setNewMessage("")
      } else {
        // Demo mode - add message locally
        const demoMessage: Message = {
          id: `demo-${Date.now()}`,
          conversation_id: currentConversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: "text",
          created_at: new Date().toISOString(),
          is_read: false,
        }
        setMessages((prev) => [...prev, demoMessage])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to access messages.</p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <Avatar className="h-10 w-10">
                  {matchUser?.avatar_url ? (
                    <AvatarImage src={matchUser.avatar_url || "/placeholder.svg"} alt={matchUser.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                      {matchUser?.name.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1">
                  <h2 className="font-semibold text-slate-800">{matchUser?.name || "Unknown User"}</h2>
                  <p className="text-sm text-slate-500">@{matchUser?.username || "unknown"}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card className="mb-4">
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-600 mb-2">Start the conversation!</h3>
                    <p className="text-sm text-slate-500">Send your first message to {matchUser?.name}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user.id
                            ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === user.id ? "text-rose-100" : "text-slate-500"
                          }`}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Message ${matchUser?.name || "user"}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
