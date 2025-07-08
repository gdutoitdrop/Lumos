"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react"

interface VideoCallInterfaceProps {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isVideoCall: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
  onEndCall: () => void
  participantInfo: {
    name: string
    username: string
    avatar_url?: string
  }
  callDuration: string
}

export function VideoCallInterface({
  localStream,
  remoteStream,
  isVideoEnabled,
  isAudioEnabled,
  isVideoCall,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  participantInfo,
  callDuration,
}: VideoCallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participantInfo.avatar_url || "/placeholder.svg"} alt={participantInfo.name} />
              <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                {participantInfo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">{participantInfo.name}</h2>
              <p className="text-sm text-white/80">@{participantInfo.username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono">{callDuration}</p>
            <p className="text-sm text-white/80">{isVideoCall ? "Video Call" : "Voice Call"}</p>
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 relative">
        {isVideoCall ? (
          <>
            {/* Remote Video */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Local Video */}
            <div className="absolute top-20 right-6 w-32 h-24 bg-slate-800 rounded-lg overflow-hidden border-2 border-white/20">
              {isVideoEnabled ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                      Y
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>

            {/* No remote video fallback */}
            {!remoteStream && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={participantInfo.avatar_url || "/placeholder.svg"} alt={participantInfo.name} />
                    <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-4xl">
                      {participantInfo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-medium mb-2">{participantInfo.name}</h3>
                  <p className="text-white/80">Connecting...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Audio Call Interface */
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center text-white">
              <Avatar className="h-48 w-48 mx-auto mb-8">
                <AvatarImage src={participantInfo.avatar_url || "/placeholder.svg"} alt={participantInfo.name} />
                <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-6xl">
                  {participantInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-4xl font-medium mb-4">{participantInfo.name}</h3>
              <p className="text-xl text-white/80 mb-2">@{participantInfo.username}</p>
              <p className="text-white/60">Voice Call • {callDuration}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
        <div className="flex justify-center space-x-6">
          <Button
            size="lg"
            onClick={onToggleAudio}
            className={`rounded-full h-16 w-16 p-0 ${
              isAudioEnabled ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {isVideoCall && (
            <Button
              size="lg"
              onClick={onToggleVideo}
              className={`rounded-full h-16 w-16 p-0 ${
                isVideoEnabled ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          )}

          <Button
            size="lg"
            onClick={onEndCall}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full h-16 w-16 p-0"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
