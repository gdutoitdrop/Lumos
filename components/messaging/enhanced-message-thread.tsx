"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Phone, Video, MoreVertical, Smile, Paperclip, Mic, MicOff, PhoneOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"]

interface EnhancedMessageThreadProps {
  conversationId: string
}

export function EnhancedMessageThread({ conversationId }: EnhancedMessageThreadProps) {
  const { user } = useAuth()
  const supabase = createClient()

  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [participant, setParticipant] = useState<Profile | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [callState, setCallState] = useState<"none" | "calling" | "in-call" | "video-call">("none")
  const [isRecording, setIsRecording] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !conversationId) return

      setLoading(true)

      try {
        // Get all messages in the conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (messagesError) throw messagesError

        // Get the other participant
        const { data: participants, error: participantsError } = await supabase
          .from("conversation_participants")
          .select("profile_id")
          .eq("conversation_id", conversationId)
          .neq("profile_id", user.id)

        if (participantsError) throw participantsError

        if (participants.length > 0) {
          const otherParticipantId = participants[0].profile_id

          // Get the other participant's profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherParticipantId)
            .single()

          if (profileError) throw profileError

          setParticipant(profile)
          // Simulate online status (in real app, this would be from presence)
          setIsOnline(Math.random() > 0.5)
        }

        // Get all senders' profiles
        const senderIds = [...new Set(messagesData.map((m) => m.profile_id))]
        const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", senderIds)

        if (profilesError) throw profilesError

        // Combine messages with sender profiles
        const messagesWithSenders = messagesData.map((message) => {
          const sender = profiles.find((p) => p.id === message.profile_id)
          return { ...message, sender: sender! }
        })

        setMessages(messagesWithSenders)

        // Mark unread messages as read
        const unreadMessages = messagesData.filter((m) => !m.is_read && m.profile_id !== user.id)

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map((message) => supabase.from("messages").update({ is_read: true }).eq("id", message.id)),
          )
        }
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
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          // Get the sender's profile
          const { data: sender, error: senderError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMessage.profile_id)
            .single()

          if (senderError) {
            console.error("Error fetching sender:", senderError)
            return
          }

          // Add the new message to the state
          setMessages((prev) => [...prev, { ...newMessage, sender }])

          // Mark the message as read if it's not from the current user
          if (newMessage.profile_id !== user.id) {
            await supabase.from("messages").update({ is_read: true }).eq("id", newMessage.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [user, conversationId, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!user || !conversationId || !newMessage.trim()) return

    setSending(true)

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        profile_id: user.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleVoiceCall = () => {
    setCallState("calling")
    // Simulate call connection
    setTimeout(() => {
      setCallState("in-call")
    }, 3000)
  }

  const handleVideoCall = () => {
    setCallState("calling")
    // Simulate call connection
    setTimeout(() => {
      setCallState("video-call")
    }, 3000)
  }

  const handleEndCall = () => {
    setCallState("none")
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop voice recording
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
    const groups: { date: string; messages: (Message & { sender: Profile })[] }[] = []

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
        <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
      </div>
    )
  }

  // Call interface
  if (callState !== "none") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="text-center mb-8">
          <Avatar className="h-32 w-32 mx-auto mb-4">
            <AvatarImage src={participant?.avatar_url || ""} alt={participant?.username || ""} />
            <AvatarFallback className="text-2xl">{participant?.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{participant?.full_name || participant?.username}</h2>
          <p className="text-slate-300">
            {callState === "calling" ? "Calling..." : callState === "in-call" ? "Voice Call" : "Video Call"}
          </p>
        </div>

        {callState === "video-call" && (
          <div className="w-full max-w-4xl aspect-video bg-slate-800 rounded-lg mb-8 flex items-center justify-center">
            <p className="text-slate-400">Video feed would appear here</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-slate-700 border-slate-600">
            <Mic className="h-6 w-6" />
          </Button>
          {callState === "video-call" && (
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-slate-700 border-slate-600">
              <Video className="h-6 w-6" />
            </Button>
          )}
          <Button onClick={handleEndCall} variant="destructive" size="icon" className="h-12 w-12 rounded-full">
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {participant && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={participant.avatar_url || ""} alt={participant.username || ""} />
                <AvatarFallback>{participant.username?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium">{participant.full_name || participant.username}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isOnline ? "Online" : "Last seen recently"}
                {isTyping && " • typing..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleVideoCall}>
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">No messages yet. Start the conversation!</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">
                  👋 Say Hello
                </Button>
                <Button variant="outline" size="sm">
                  😊 Send a Smile
                </Button>
              </div>
            </div>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  {group.date}
                </Badge>
              </div>

              {group.messages.map((message, messageIndex) => {
                const isCurrentUser = message.profile_id === user?.id

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[80%]`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.avatar_url || ""} alt={message.sender.username || ""} />
                          <AvatarFallback>{message.sender.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      )}

                      <Card
                        className={`${
                          isCurrentUser
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
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

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="space-y-3"
        >
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[60px] resize-none pr-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="absolute bottom-2 right-2 h-8 w-8">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  // Handle file upload
                  console.log("File selected:", e.target.files?.[0])
                }}
              />
              <Button type="button" variant="ghost" size="icon" onClick={handleFileUpload}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceRecord}
                className={isRecording ? "text-red-500" : ""}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                type="submit"
                size="icon"
                className="bg-rose-500 hover:bg-rose-600 text-white"
                disabled={sending || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
