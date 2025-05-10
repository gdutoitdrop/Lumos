"use client"

import type React from "react"

import { sendMessage } from "@/actions/messaging"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface MessageThreadProps {
  conversationId: string
  initialMessages: Message[]
  otherParticipant: Pick<Profile, "id" | "full_name" | "avatar_url">
  currentUserId: string
}

export function MessageThread({
  conversationId,
  initialMessages,
  otherParticipant,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])

          // Mark message as read if it's from the other participant
          if (newMessage.profile_id !== currentUserId) {
            supabase.from("messages").update({ is_read: true }).eq("id", newMessage.id).then()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const result = await sendMessage(conversationId, newMessage)
    if (result.error) {
      console.error("Error sending message:", result.error)
      return
    }

    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.profile_id === currentUserId ? "justify-end" : "justify-start"}`}
          >
            {message.profile_id !== currentUserId && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={otherParticipant.avatar_url || undefined} alt={otherParticipant.full_name} />
                <AvatarFallback>{otherParticipant.full_name.substring(0, 2)}</AvatarFallback>
              </Avatar>
            )}
            <div className="max-w-[70%]">
              <Card
                className={`p-3 ${
                  message.profile_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.content}
              </Card>
              <p className="text-xs text-muted-foreground mt-1">
                {message.created_at
                  ? formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                    })
                  : ""}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      <Send className="h-4 w-4" />
      <span className="sr-only">Send</span>
    </Button>
  )
}
