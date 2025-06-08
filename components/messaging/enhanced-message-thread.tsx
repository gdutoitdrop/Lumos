"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function EnhancedMessageThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [participant, setParticipant] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !conversationId) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Get messages
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        // Get other participant
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("profile_id")
          .eq("conversation_id", conversationId)
          .neq("profile_id", user.id)

        if (participants && participants.length > 0) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", participants[0].profile_id)
            .single()

          setParticipant(profile)
        }

        // Get sender profiles for messages
        if (messagesData && messagesData.length > 0) {
          const senderIds = [...new Set(messagesData.map((m) => m.profile_id))]
          const { data: profiles } = await supabase.from("profiles").select("*").in("id", senderIds)

          const messagesWithSenders = messagesData.map((message) => {
            const sender = profiles?.find((p) => p.id === message.profile_id)
            return { ...message, sender }
          })

          setMessages(messagesWithSenders)
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Subscribe to new messages
    const subscription = supabase
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
          const newMessage = payload.new as any
          const { data: sender } = await supabase.from("profiles").select("*").eq("id", newMessage.profile_id).single()

          setMessages((prev) => [...prev, { ...newMessage, sender }])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, conversationId])

  useEffect(() => {
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
      alert("Failed to send message. Please try again.")
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
        <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      {participant && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={participant.avatar_url || ""} alt={participant.username || ""} />
            <AvatarFallback>{participant.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{participant.full_name || participant.username}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{participant.username}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">No messages yet. Start the conversation!</p>
              <Button variant="outline" size="sm" onClick={() => setNewMessage("Hello! How are you?")}>
                Say Hello
              </Button>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.profile_id === user?.id

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[80%]`}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender?.avatar_url || ""} alt={message.sender?.username || ""} />
                      <AvatarFallback>{message.sender?.username?.charAt(0) || "U"}</AvatarFallback>
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-rose-500 hover:bg-rose-600 text-white"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
