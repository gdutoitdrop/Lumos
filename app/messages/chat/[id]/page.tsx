"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, ArrowLeft, Phone, Video, User } from "lucide-react"

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

// Demo conversation starters
const conversationStarters = {
  sarah: "Hi! I saw we both love meditation. What's your favorite practice? 🧘‍♀️",
  alex: "Hey! How are you doing today? I hope you're having a good day. 🎨",
  emma: "Hello! I love that you're into yoga too. What style do you practice? 🧘‍♀️",
}

// Demo responses
const demoResponses = {
  sarah: [
    "I've been really into mindfulness meditation lately. It helps so much with my anxiety!",
    "Have you tried the Headspace app? It's been a game changer for me.",
    "I love doing walking meditation in Golden Gate Park. The nature really helps center me.",
    "What techniques work best for you when you're feeling overwhelmed?",
  ],
  alex: [
    "Thanks for asking! I'm doing better today. Art therapy session went really well.",
    "I've been working on some paintings that help me process my emotions.",
    "How has your mental health journey been going lately?",
    "Sometimes creating something beautiful helps me see the light in dark moments.",
  ],
  emma: [
    "I practice mostly vinyasa flow, but I love yin yoga for relaxation too!",
    "Yoga has been incredible for helping me focus with my ADHD.",
    "Do you have a favorite studio or do you practice at home?",
    "The mind-body connection in yoga is so powerful for mental health.",
  ],
}

export default function ChatPage() {
  const params = useParams()
  const matchId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get match info
  const match = demoMatches[matchId as keyof typeof demoMatches]

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Initialize conversation
  useEffect(() => {
    if (match) {
      const starter = conversationStarters[matchId as keyof typeof conversationStarters]
      if (starter) {
        setMessages([
          {
            id: 1,
            content: starter,
            senderId: matchId,
            timestamp: new Date(Date.now() - 300000).toISOString(),
            isCurrentUser: false,
          },
        ])
      }
    }
  }, [match, matchId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    try {
      // Add user message immediately
      const userMessage = {
        id: Date.now(),
        content: newMessage.trim(),
        senderId: "current-user",
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
      }

      setMessages((prev) => [...prev, userMessage])
      setNewMessage("")

      // Show typing indicator
      setIsTyping(true)

      // Simulate response after delay
      setTimeout(
        () => {
          setIsTyping(false)

          const responses = demoResponses[matchId as keyof typeof demoResponses] || []
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]

          if (randomResponse) {
            const botMessage = {
              id: Date.now() + 1,
              content: randomResponse,
              senderId: matchId,
              timestamp: new Date().toISOString(),
              isCurrentUser: false,
            }

            setMessages((prev) => [...prev, botMessage])
          }
        },
        2000 + Math.random() * 2000,
      ) // 2-4 second delay
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Unable to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const viewProfile = () => {
    window.location.href = `/profile/${matchId}`
  }

  if (!match) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Match not found</h2>
            <p className="text-slate-500 mb-4">This conversation doesn't exist.</p>
            <Button onClick={() => (window.location.href = "/messages")}>Back to Messages</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => (window.location.href = "/messages")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Avatar className="h-10 w-10 cursor-pointer" onClick={viewProfile}>
            <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} />
            <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">{match.name}</h2>
              {match.status === "online" && <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {match.journey} • {match.location}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={viewProfile}>
              <User className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex ${message.isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[80%]`}
              >
                {!message.isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} />
                    <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <Card
                  className={`${
                    message.isCurrentUser
                      ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white border-none"
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isCurrentUser ? "text-rose-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={match.avatar || "/placeholder.svg"} alt={match.name} />
                  <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Card className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              placeholder={`Message ${match.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={isSending}
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
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
              disabled={!newMessage.trim() || isSending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {isSending && <p className="text-xs text-slate-500 mt-1">Sending message...</p>}
        </div>
      </div>
    </DashboardLayout>
  )
}
