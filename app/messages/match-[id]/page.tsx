"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { messagingService, type Message, type Profile } from "@/lib/messaging-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Send, MoreVertical, UserX, Phone, Video, User, CheckCircle, AlertCircle } from "lucide-react"

export default function MatchConversationPage() {
  const params = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [conversationId, setConversationId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const matchId = params?.id as string
  const otherUserId = matchId?.replace("match-", "") || ""

  useEffect(() => {
    const initializeConversation = async () => {
      if (!user || !otherUserId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Get other user's profile
        const profile = await messagingService.getProfile(otherUserId)
        setOtherUser(profile)

        // Set conversation ID (for demo purposes, use the other user ID)
        const convId = otherUserId.startsWith("demo-") ? `demo-conv-${otherUserId}` : otherUserId
        setConversationId(convId)

        // Load messages
        const conversationMessages = await messagingService.getConversationMessages(convId)
        setMessages(conversationMessages)

        // Subscribe to new messages
        const subscription = messagingService.subscribeToMessages(convId, (message) => {
          setMessages((prev) => [...prev, message])
        })

        return () => {
          if (subscription && typeof subscription.unsubscribe === "function") {
            subscription.unsubscribe()
          }
        }
      } catch (error) {
        console.error("Error initializing conversation:", error)
        setError("Failed to load conversation")
      } finally {
        setLoading(false)
      }
    }

    initializeConversation()
  }, [user, otherUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user || !conversationId || sending) return

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      const message = await messagingService.sendMessage(conversationId, user.id, newMessage.trim())

      if (message) {
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        setSuccess("Message sent!")
        setTimeout(() => setSuccess(null), 2000)
      } else {
        setError("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleUnmatch = async () => {
    try {
      console.log("Unmatching with user:", otherUserId)
      // In a real app, you'd call an unmatch API here
      window.location.href = "/messages"
    } catch (error) {
      console.error("Error unmatching:", error)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Loading conversation...</h3>
          <p className="text-slate-500">Setting up your chat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/messages")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <Avatar className="h-10 w-10">
                    {otherUser?.avatar_url ? (
                      <AvatarImage
                        src={otherUser.avatar_url || "/placeholder.svg"}
                        alt={otherUser.full_name || otherUser.username}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                        {(otherUser?.full_name || otherUser?.username || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      {otherUser?.full_name || otherUser?.username || "Loading..."}
                    </h2>
                    {otherUser?.username && <p className="text-sm text-slate-500">@{otherUser.username}</p>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Video className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => (window.location.href = `/profile/${otherUserId}`)}>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <UserX className="mr-2 h-4 w-4" />
                            Unmatch
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unmatch with {otherUser?.full_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove them from your matches and delete your conversation history. This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUnmatch} className="bg-red-600 hover:bg-red-700">
                              Unmatch
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-600 mb-2">Start the conversation!</h3>
                    <p className="text-sm text-slate-500">
                      Say hello to {otherUser?.full_name || "your match"} and break the ice.
                    </p>
                  </div>
                ) : (
                  groupMessagesByDate().map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      {/* Date separator */}
                      <div className="flex justify-center">
                        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{group.date}</span>
                      </div>

                      {/* Messages for this date */}
                      {group.messages.map((message) => {
                        const isCurrentUser = message.sender_id === user.id

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
                                ) : otherUser?.avatar_url ? (
                                  <AvatarImage
                                    src={otherUser.avatar_url || "/placeholder.svg"}
                                    alt={otherUser.full_name || otherUser.username}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-slate-200">
                                    {(otherUser?.full_name || otherUser?.username || "U").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>

                              <Card
                                className={`${
                                  isCurrentUser
                                    ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-none"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <CardContent className="p-3">
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                  <p className={`text-xs mt-2 ${isCurrentUser ? "text-rose-100" : "text-slate-500"}`}>
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
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Textarea
                  placeholder={`Message ${otherUser?.full_name || "user"}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 self-end"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
