"use client"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SimpleMessageThread } from "@/components/messaging/simple-message-thread"

// Demo matches data
const demoMatches = {
  sarah: {
    id: "sarah",
    name: "Sarah Chen",
    username: "sarah_mindful",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    journey: "Meditation & Anxiety",
    location: "San Francisco, CA",
  },
  alex: {
    id: "alex",
    name: "Alex Rivera",
    username: "alex_creates",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    journey: "Art Therapy & Depression",
    location: "Austin, TX",
  },
  emma: {
    id: "emma",
    name: "Emma Thompson",
    username: "emma_flows",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    journey: "Yoga & ADHD",
    location: "Portland, OR",
  },
}

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const matchId = "22222222-2222-2222-2222-222222222222" // Hardcoded sample match ID

  return (
    <DashboardLayout>
      <SimpleMessageThread conversationId={conversationId} matchId={matchId} />
    </DashboardLayout>
  )
}
