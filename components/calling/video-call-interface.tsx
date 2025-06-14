"use client"

import { useRef, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CallControls } from "./call-controls"
import { User, Maximize2, Minimize2 } from "lucide-react"

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  // Set up video streams
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

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
      setShowControls(true)
      const timeout = setTimeout(() => setShowControls(false), 3000)
      setControlsTimeout(timeout)
    }

    resetControlsTimeout()
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [])

  const handleMouseMove = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    setShowControls(true)
    const timeout = setTimeout(() => setShowControls(false), 3000)
    setControlsTimeout(timeout)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      className={`relative w-full h-screen bg-black overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      onMouseMove={handleMouseMove}
    >
      {/* Remote Video (Main) */}
      <div className="absolute inset-0">
        {remoteStream && isVideoCall ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4 ring-4 ring-white/20">
                {participantInfo.avatar_url ? (
                  <AvatarImage src={participantInfo.avatar_url || "/placeholder.svg"} alt={participantInfo.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-4xl">
                    {participantInfo.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="text-2xl font-bold text-white mb-2">{participantInfo.name}</h2>
              <p className="text-slate-300">@{participantInfo.username}</p>
              {!isVideoCall && <p className="text-slate-400 mt-4">Audio call in progress</p>}
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {isVideoCall && (
        <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <User className="h-12 w-12 text-slate-400" />
            </div>
          )}
        </div>
      )}

      {/* Call Info */}
      <div
        className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <Card className="bg-black/50 backdrop-blur-sm border-white/20">
          <div className="p-4 text-white">
            <h3 className="font-semibold">{participantInfo.name}</h3>
            <p className="text-sm text-slate-300">{callDuration}</p>
          </div>
        </Card>
      </div>

      {/* Call Controls */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <CallControls
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isVideoCall={isVideoCall}
          onToggleVideo={onToggleVideo}
          onToggleAudio={onToggleAudio}
          onEndCall={onEndCall}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>

      {/* Fullscreen Toggle (always visible) */}
      <Button
        size="sm"
        variant="secondary"
        className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
