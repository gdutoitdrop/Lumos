"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { createConversation } from "@/actions/messaging"
import { useState } from "react"

interface MessageButtonProps {
  profileId: string
  className?: string
}

export function MessageButton({ profileId, className }: MessageButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await createConversation(profileId)
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline" size="sm" className={className}>
      <MessageCircle className="h-4 w-4 mr-2" />
      {loading ? "Connecting..." : "Message"}
    </Button>
  )
}
