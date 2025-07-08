"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, Video } from "lucide-react"

interface IncomingCallModalProps {
  callData: {
    callId: string
    fromUserId: string
    toUserId: string
    callType: "audio" | "video"
  }
  callerInfo: {
    name: string
    username: string
    avatar_url?: string
  }
  onAccept: () => void
  onReject: () => void
}

export function IncomingCallModal({ callData, callerInfo, onAccept, onReject }: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={callerInfo.avatar_url || "/placeholder.svg"} alt={callerInfo.name} />
            <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-2xl">
              {callerInfo.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{callerInfo.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-1">@{callerInfo.username}</p>
          <p className="text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
            {callData.callType === "video" ? (
              <>
                <Video className="h-4 w-4" />
                Incoming video call
              </>
            ) : (
              <>
                <Phone className="h-4 w-4" />
                Incoming voice call
              </>
            )}
          </p>
        </div>

        <div className="flex justify-center gap-6">
          <Button
            size="lg"
            onClick={onReject}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full h-16 w-16 p-0"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            onClick={onAccept}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full h-16 w-16 p-0"
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Tap to {callData.callType === "video" ? "join video call" : "answer call"}
        </p>
      </div>
    </div>
  )
}
