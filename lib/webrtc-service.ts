import { messagingService } from "./messaging-service"

export interface CallData {
  callId: string
  fromUserId: string
  toUserId: string
  callType: "audio" | "video"
  signalType: "offer" | "answer" | "ice-candidate" | "call-start" | "call-end" | "call-accept" | "call-reject"
  data?: any
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private currentCallId: string | null = null
  private isInitiator = false

  // Callbacks
  public onRemoteStream?: (stream: MediaStream) => void
  public onCallEnd?: () => void
  public onIncomingCall?: (callData: CallData) => void
  public onCallAccepted?: () => void
  public onCallRejected?: () => void

  constructor() {
    this.setupPeerConnection()
  }

  private setupPeerConnection() {
    try {
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      }

      this.peerConnection = new RTCPeerConnection(configuration)

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.currentCallId) {
          this.sendSignal({
            callId: this.currentCallId,
            fromUserId: "",
            toUserId: "",
            callType: "video",
            signalType: "ice-candidate",
            data: event.candidate,
          })
        }
      }

      this.peerConnection.ontrack = (event) => {
        console.log("Received remote stream")
        this.remoteStream = event.streams[0]
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream)
        }
      }

      this.peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", this.peerConnection?.connectionState)
        if (
          this.peerConnection?.connectionState === "disconnected" ||
          this.peerConnection?.connectionState === "failed" ||
          this.peerConnection?.connectionState === "closed"
        ) {
          this.endCall()
        }
      }

      this.peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", this.peerConnection?.iceConnectionState)
      }

      console.log("Peer connection setup complete")
    } catch (error) {
      console.error("Error setting up peer connection:", error)
    }
  }

  async getMediaDevices(): Promise<{ videoDevices: MediaDeviceInfo[]; audioDevices: MediaDeviceInfo[] }> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return { videoDevices: [], audioDevices: [] }
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      return {
        videoDevices: devices.filter((device) => device.kind === "videoinput"),
        audioDevices: devices.filter((device) => device.kind === "audioinput"),
      }
    } catch (error) {
      console.error("Error getting media devices:", error)
      return { videoDevices: [], audioDevices: [] }
    }
  }

  async startCall(fromUserId: string, toUserId: string, callType: "audio" | "video"): Promise<string> {
    try {
      console.log("Starting call:", { fromUserId, toUserId, callType })

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported")
      }

      this.currentCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.isInitiator = true

      // Get user media
      const constraints = {
        video: callType === "video",
        audio: true,
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Got local stream")

      // Add tracks to peer connection
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream)
          }
        })
      }

      // Send call start signal
      await this.sendSignal({
        callId: this.currentCallId,
        fromUserId,
        toUserId,
        callType,
        signalType: "call-start",
      })

      console.log("Call started with ID:", this.currentCallId)
      return this.currentCallId
    } catch (error) {
      console.error("Error starting call:", error)
      throw error
    }
  }

  async acceptCall(callData: CallData): Promise<void> {
    try {
      console.log("Accepting call:", callData)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported")
      }

      this.currentCallId = callData.callId
      this.isInitiator = false

      // Get user media
      const constraints = {
        video: callData.callType === "video",
        audio: true,
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Got local stream for call accept")

      // Add tracks to peer connection
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream)
          }
        })
      }

      // Send accept signal
      await this.sendSignal({
        callId: callData.callId,
        fromUserId: callData.toUserId,
        toUserId: callData.fromUserId,
        callType: callData.callType,
        signalType: "call-accept",
      })

      console.log("Call accepted")
    } catch (error) {
      console.error("Error accepting call:", error)
      throw error
    }
  }

  async rejectCall(callData: CallData): Promise<void> {
    try {
      console.log("Rejecting call:", callData)

      await this.sendSignal({
        callId: callData.callId,
        fromUserId: callData.toUserId,
        toUserId: callData.fromUserId,
        callType: callData.callType,
        signalType: "call-reject",
      })

      console.log("Call rejected")
    } catch (error) {
      console.error("Error rejecting call:", error)
    }
  }

  async handleOffer(callData: CallData): Promise<void> {
    try {
      console.log("Handling offer:", callData)

      if (this.peerConnection && callData.data) {
        await this.peerConnection.setRemoteDescription(callData.data)

        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)

        await this.sendSignal({
          callId: callData.callId,
          fromUserId: callData.toUserId,
          toUserId: callData.fromUserId,
          callType: callData.callType,
          signalType: "answer",
          data: answer,
        })

        console.log("Offer handled and answer sent")
      }
    } catch (error) {
      console.error("Error handling offer:", error)
    }
  }

  async handleAnswer(callData: CallData): Promise<void> {
    try {
      console.log("Handling answer:", callData)

      if (this.peerConnection && callData.data) {
        await this.peerConnection.setRemoteDescription(callData.data)
        console.log("Answer handled")
      }
    } catch (error) {
      console.error("Error handling answer:", error)
    }
  }

  async handleIceCandidate(callData: CallData): Promise<void> {
    try {
      console.log("Handling ICE candidate:", callData)

      if (this.peerConnection && callData.data) {
        await this.peerConnection.addIceCandidate(callData.data)
        console.log("ICE candidate added")
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error)
    }
  }

  async createOffer(): Promise<void> {
    try {
      if (this.peerConnection && this.currentCallId) {
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)

        await this.sendSignal({
          callId: this.currentCallId,
          fromUserId: "",
          toUserId: "",
          callType: "video",
          signalType: "offer",
          data: offer,
        })

        console.log("Offer created and sent")
      }
    } catch (error) {
      console.error("Error creating offer:", error)
    }
  }

  async endCall(): Promise<void> {
    try {
      console.log("Ending call")

      if (this.currentCallId) {
        await this.sendSignal({
          callId: this.currentCallId,
          fromUserId: "",
          toUserId: "",
          callType: "video",
          signalType: "call-end",
        })
      }

      // Clean up
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop())
        this.localStream = null
      }

      if (this.peerConnection) {
        this.peerConnection.close()
        this.setupPeerConnection()
      }

      this.currentCallId = null
      this.isInitiator = false
      this.remoteStream = null

      if (this.onCallEnd) {
        this.onCallEnd()
      }

      console.log("Call ended")
    } catch (error) {
      console.error("Error ending call:", error)
    }
  }

  toggleVideo(): boolean {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled
          console.log("Video toggled:", videoTrack.enabled)
          return videoTrack.enabled
        }
      }
      return false
    } catch (error) {
      console.error("Error toggling video:", error)
      return false
    }
  }

  toggleAudio(): boolean {
    try {
      if (this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0]
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled
          console.log("Audio toggled:", audioTrack.enabled)
          return audioTrack.enabled
        }
      }
      return false
    } catch (error) {
      console.error("Error toggling audio:", error)
      return false
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  getCurrentCallId(): string | null {
    return this.currentCallId
  }

  private async sendSignal(callData: CallData): Promise<void> {
    try {
      await messagingService.sendCallSignal({
        call_id: callData.callId,
        signal_type: callData.signalType,
        from_user_id: callData.fromUserId,
        to_user_id: callData.toUserId,
        call_type: callData.callType,
        signal_data: callData.data,
      })
    } catch (error) {
      console.error("Error sending signal:", error)
    }
  }

  subscribeToSignals(userId: string, onSignal: (callData: CallData) => void): void {
    messagingService.subscribeToCallSignals(userId, (signal) => {
      const callData: CallData = {
        callId: signal.call_id,
        fromUserId: signal.from_user_id,
        toUserId: signal.to_user_id,
        callType: signal.call_type,
        signalType: signal.signal_type,
        data: signal.signal_data,
      }
      onSignal(callData)
    })
  }
}

export const webRTCService = new WebRTCService()
