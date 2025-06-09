"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneOff, Video, VideoOff, Mic, MicOff, Settings, Maximize2, Minimize2 } from "lucide-react"

interface CallControlsProps {
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isVideoCall: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
  onEndCall: () => void
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
}

export function CallControls({
  isVideoEnabled,
  isAudioEnabled,
  isVideoCall,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  onToggleFullscreen,
  isFullscreen = false,
}: CallControlsProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-black/50 backdrop-blur-sm rounded-lg">
      {/* Audio Toggle */}
      <Button
        size="lg"
        variant={isAudioEnabled ? "secondary" : "destructive"}
        className={`rounded-full w-14 h-14 ${
          isAudioEnabled ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
        }`}
        onClick={onToggleAudio}
      >
        {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>

      {/* Video Toggle (only for video calls) */}
      {isVideoCall && (
        <Button
          size="lg"
          variant={isVideoEnabled ? "secondary" : "destructive"}
          className={`rounded-full w-14 h-14 ${
            isVideoEnabled ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          onClick={onToggleVideo}
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
      )}

      {/* End Call */}
      <Button
        size="lg"
        variant="destructive"
        className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 text-white"
        onClick={onEndCall}
      >
        <PhoneOff className="h-6 w-6" />
      </Button>

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <Button
          size="lg"
          variant="secondary"
          className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 text-white"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
        </Button>
      )}

      {/* Settings */}
      <Button
        size="lg"
        variant="secondary"
        className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 text-white"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings className="h-6 w-6" />
      </Button>
    </div>
  )
}
