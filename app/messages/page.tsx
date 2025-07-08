"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MessageThread } from "@/components/messaging/message-thread"
import { ConversationsList } from "@/components/messaging/conversations-list"
import { IncomingCallModal } from "@/components/messaging/incoming-call-modal"
import { VideoCallInterface } from "@/components/messaging/video-call-interface"
import { MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { webRTCService, type CallData } from "@/lib/webrtc-service"
import { messagingService } from "@/lib/messaging-service"

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  // Call state
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null)
  const [currentCall, setCurrentCall] = useState<CallData | null>(null)
  const [isInCall, setIsInCall] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState("00:00")
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [callerInfo, setCallerInfo] = useState<{ name: string; username: string; avatar_url?: string } | null>(null)

  useEffect(() => {
    // Check if there's a conversation ID in the URL
    const conversationId = searchParams.get("conversation")
    if (conversationId) {
      setSelectedConversationId(conversationId)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user) return

    // Set up WebRTC callbacks
    webRTCService.onRemoteStream = (stream) => {
      console.log("Received remote stream")
      setRemoteStream(stream)
    }

    webRTCService.onCallEnd = () => {
      console.log("Call ended")
      handleEndCall()
    }

    // Subscribe to call signals
    webRTCService.subscribeToSignals(user.id, async (callData) => {
      console.log("Received call signal:", callData)

      switch (callData.signalType) {
        case "call-start":
          // Incoming call
          const { data: profile } = await messagingService.supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", callData.fromUserId)
            .single()

          if (profile) {
            setCallerInfo({
              name: profile.full_name || profile.username || "Unknown User",
              username: profile.username || "unknown",
              avatar_url: profile.avatar_url,
            })
          }

          setIncomingCall(callData)
          break

        case "call-accept":
          // Call was accepted
          console.log("Call accepted")
          await webRTCService.createOffer()
          break

        case "call-reject":
          // Call was rejected
          console.log("Call rejected")
          setCurrentCall(null)
          setIncomingCall(null)
          break

        case "offer":
          await webRTCService.handleOffer(callData)
          break

        case "answer":
          await webRTCService.handleAnswer(callData)
          break

        case "ice-candidate":
          await webRTCService.handleIceCandidate(callData)
          break

        case "call-end":
          handleEndCall()
          break
      }
    })

    return () => {
      // Cleanup
      webRTCService.endCall()
    }
  }, [user])

  // Update call duration
  useEffect(() => {
    if (!callStartTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = now.getTime() - callStartTime.getTime()
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setCallDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [callStartTime])

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set("conversation", conversationId)
    window.history.pushState({}, "", url.toString())
  }

  const handleStartCall = async (toUserId: string, callType: "audio" | "video") => {
    if (!user) return

    try {
      console.log("Starting call to:", toUserId, "type:", callType)

      const callId = await webRTCService.startCall(user.id, toUserId, callType)

      setCurrentCall({
        callId,
        fromUserId: user.id,
        toUserId,
        callType,
        signalType: "call-start",
      })

      setIsInCall(true)
      setCallStartTime(new Date())
      setLocalStream(webRTCService.getLocalStream())
      setIsVideoEnabled(callType === "video")
      setIsAudioEnabled(true)

      // Send call start message to conversation
      const conversations = await messagingService.getUserConversations(user.id)
      const conversation = conversations.find((c) => c.participants.some((p) => p.user_id === toUserId))

      if (conversation) {
        await messagingService.sendMessage(conversation.id, user.id, `Started a ${callType} call`, "call_start")
      }
    } catch (error) {
      console.error("Error starting call:", error)
    }
  }

  const handleAcceptCall = async () => {
    if (!incomingCall || !user) return

    try {
      console.log("Accepting call")

      await webRTCService.acceptCall(incomingCall)

      setCurrentCall(incomingCall)
      setIsInCall(true)
      setCallStartTime(new Date())
      setLocalStream(webRTCService.getLocalStream())
      setIsVideoEnabled(incomingCall.callType === "video")
      setIsAudioEnabled(true)
      setIncomingCall(null)
    } catch (error) {
      console.error("Error accepting call:", error)
    }
  }

  const handleRejectCall = async () => {
    if (!incomingCall) return

    try {
      console.log("Rejecting call")
      await webRTCService.rejectCall(incomingCall)
      setIncomingCall(null)
      setCallerInfo(null)
    } catch (error) {
      console.error("Error rejecting call:", error)
    }
  }

  const handleEndCall = async () => {
    try {
      console.log("Ending call")

      if (currentCall && user) {
        // Send call end message to conversation
        const conversations = await messagingService.getUserConversations(user.id)
        const conversation = conversations.find((c) =>
          c.participants.some((p) => p.user_id === currentCall.toUserId || p.user_id === currentCall.fromUserId),
        )

        if (conversation) {
          await messagingService.sendMessage(
            conversation.id,
            user.id,
            `Call ended • Duration: ${callDuration}`,
            "call_end",
          )
        }
      }

      await webRTCService.endCall()

      setCurrentCall(null)
      setIsInCall(false)
      setLocalStream(null)
      setRemoteStream(null)
      setCallStartTime(null)
      setCallDuration("00:00")
      setIncomingCall(null)
      setCallerInfo(null)
    } catch (error) {
      console.error("Error ending call:", error)
    }
  }

  const handleToggleVideo = () => {
    const enabled = webRTCService.toggleVideo()
    setIsVideoEnabled(enabled)
  }

  const handleToggleAudio = () => {
    const enabled = webRTCService.toggleAudio()
    setIsAudioEnabled(enabled)
  }

  // If in call, show video interface
  if (isInCall && currentCall && callerInfo) {
    return (
      <VideoCallInterface
        localStream={localStream}
        remoteStream={remoteStream}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isVideoCall={currentCall.callType === "video"}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onEndCall={handleEndCall}
        participantInfo={callerInfo}
        callDuration={callDuration}
      />
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <ConversationsList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
            onStartCall={handleStartCall}
          />
        </div>

        {/* Right Side - Message Thread or Empty State */}
        <div className="hidden md:flex flex-1">
          {selectedConversationId ? (
            <MessageThread conversationId={selectedConversationId} onStartCall={handleStartCall} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              <div className="text-center max-w-md">
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-slate-700 dark:text-slate-300">Select a conversation</h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Choose a conversation from the list to start messaging, calling, or video chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && callerInfo && (
        <IncomingCallModal
          callData={incomingCall}
          callerInfo={callerInfo}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </DashboardLayout>
  )
}
