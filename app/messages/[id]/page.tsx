"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { messagingService } from "@/lib/messaging-service"
import { MessageThread } from "@/components/messaging/message-thread"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export default function MessagePage() {
  const { user } = useAuth()
  const params = useParams()
  const conversationId = params.id as string
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!user || !conversationId) {
        setLoading(false)
        return
      }

      try {
        const conversations = await messagingService.getUserConversations(user.id)
        const conversation = conversations.find((c) => c.id === conversationId)

        if (conversation) {
          setOtherUser(conversation.other_user)
        } else {
          // Handle demo conversations or create demo user
          setOtherUser({
            id: "demo-user-1",
            username: "sarah_j",
            full_name: "Sarah Johnson",
            avatar_url: "/placeholder.svg?height=40&width=40&text=SJ",
          })
        }
      } catch (error) {
        console.error("Error fetching conversation details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversationDetails()
  }, [user, conversationId])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <div className="bg-rose-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-4">Please log in to view messages.</p>
            <Button
              asChild
              className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
            >
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-200px)]">
        <Card className="h-full">
          <MessageThread conversationId={conversationId} otherUser={otherUser} />
        </Card>
      </div>
    </div>
  )
}
