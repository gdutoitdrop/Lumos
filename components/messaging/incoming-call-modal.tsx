"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, PhoneOff, Video } from "lucide-react"
import type { CallData } from "@/lib/webrtc-service"

interface IncomingCallModalProps {
  callData: CallData
  callerInfo: {
    name: string
    username: string
    avatar_url?: string
  }
  onAccept: () => void
  onReject: () => void
}

export function IncomingCallModal({ callData, callerInfo, onAccept, onReject }: IncomingCallModalProps) {
  const [isResponding, setIsResponding] = useState(false)

  const handleAccept = async () => {
    setIsResponding(true)
    try {
      await onAccept()
    } catch (error) {
      console.error("Error accepting call:", error)
    }
    setIsResponding(false)
  }

  const handleReject = async () => {
    setIsResponding(true)
    try {
      await onReject()
    } catch (error) {
      console.error("Error rejecting call:", error)
    }
    setIsResponding(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Caller Avatar */}
          <div className="relative mb-6">
            <Avatar className="w-24 h-24 mx-auto ring-4 ring-white dark:ring-slate-700 shadow-lg">
              <AvatarImage src={callerInfo.avatar_url || "/placeholder.svg"} alt={callerInfo.name} />
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-2xl">
                {callerInfo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Call type indicator */}
            <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
              {callData.callType === "video" ? (
                <Video className="h-4 w-4 text-white" />
              ) : (
                <Phone className="h-4 w-4 text-white" />
              )}
            </div>
          </div>

          {/* Caller Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{callerInfo.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-2">@{callerInfo.username}</p>
            <p className="text-lg text-slate-600 dark:text-slate-300">Incoming {callData.callType} call...</p>
          </div>

          {/* Animated rings */}
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-20"></div>
            <div className="absolute inset-2 rounded-full border-4 border-blue-500 animate-ping opacity-40 animation-delay-75"></div>
            <div className="absolute inset-4 rounded-full border-4 border-blue-500 animate-ping opacity-60 animation-delay-150"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-8">
            {/* Reject Button */}
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={handleReject}
              disabled={isResponding}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>

            {/* Accept Button */}
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700 text-white shadow-lg"
              onClick={handleAccept}
              disabled={isResponding}
            >
              <Phone className="h-8 w-8" />
            </Button>
          </div>

          {/* Loading state */}
          {isResponding && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Connecting...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
