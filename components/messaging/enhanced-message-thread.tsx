"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowLeft } from "lucide-react"

export function EnhancedMessageThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!user || !conversationId || !newMessage.trim()) return

    setSending(true)

    try {
      // Simulate sending message
      console.log("Sending message:", newMessage)
      setNewMessage("")

      // In a real implementation, this would send to the database
      // For now, just clear the message
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-medium">Conversation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">ID: {conversationId}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Messaging Coming Soon</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              The messaging feature is being set up. You'll be able to chat here once it's ready.
            </p>
            <Button variant="outline" onClick={() => (window.location.href = "/matching")}>
              Find People to Connect With
            </Button>
          </div>
        </div>
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
            disabled={true} // Disabled until messaging is fully set up
          />
          <Button
            type="submit"
            size="icon"
            className="bg-rose-500 hover:bg-rose-600 text-white"
            disabled={sending || !newMessage.trim() || true} // Disabled until messaging is fully set up
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
