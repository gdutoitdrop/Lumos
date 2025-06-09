export interface CallData {
  type: "offer" | "answer" | "ice-candidate" | "call-start" | "call-end" | "call-accept" | "call-reject"
  callId: string
  fromUserId: string
  toUserId: string
  callType: "video" | "audio"
  data?: any
}

export interface MediaDevices {
  videoDevices: MediaDeviceInfo[]
  audioDevices: MediaDeviceInfo[]
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private supabase: any
  private currentCallId: string | null = null
  private isInitiator = false

  // Callbacks
  public onRemoteStream?: (stream: MediaStream) => void
  public onCallEnd?: () => void
  public onCallStart?: (callData: CallData) => void
  public onIncomingCall?: (callData: CallData) => void

  constructor(supabase: any) {
    this.supabase = supabase
    this.setupPeerConnection()
  }

  private setupPeerConnection() {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    }

    this.peerConnection = new RTCPeerConnection(configuration)

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentCallId) {
        this.sendSignal({
          type: "ice-candidate",
          callId: this.currentCallId,
          fromUserId: "",
          toUserId: "",
          callType: "video",
          data: event.candidate,
        })
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream)
      }
    }

    this.peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", this.peerConnection?.connectionState)
      if (
        this.peerConnection?.connectionState === "disconnected" ||
        this.peerConnection?.connectionState === "failed"
      ) {
        this.endCall()
      }
    }
  }

  async getMediaDevices(): Promise<MediaDevices> {
    try {
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

  async startCall(toUserId: string, callType: "video" | "audio"): Promise<string> {
    try {
      this.currentCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.isInitiator = true

      // Get user media
      const constraints = {
        video: callType === "video",
        audio: true,
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Add tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })

      // Send call start signal
      await this.sendSignal({
        type: "call-start",
        callId: this.currentCallId,
        fromUserId: "",
        toUserId,
        callType,
      })

      // Create offer
      const offer = await this.peerConnection!.createOffer()
      await this.peerConnection!.setLocalDescription(offer)

      // Send offer
      await this.sendSignal({
        type: "offer",
        callId: this.currentCallId,
        fromUserId: "",
        toUserId,
        callType,
        data: offer,
      })

      return this.currentCallId
    } catch (error) {
      console.error("Error starting call:", error)
      throw error
    }
  }

  async acceptCall(callData: CallData): Promise<void> {
    try {
      this.currentCallId = callData.callId
      this.isInitiator = false

      // Get user media
      const constraints = {
        video: callData.callType === "video",
        audio: true,
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Add tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })

      // Send accept signal
      await this.sendSignal({
        type: "call-accept",
        callId: callData.callId,
        fromUserId: "",
        toUserId: callData.fromUserId,
        callType: callData.callType,
      })
    } catch (error) {
      console.error("Error accepting call:", error)
      throw error
    }
  }

  async handleOffer(callData: CallData): Promise<void> {
    try {
      await this.peerConnection!.setRemoteDescription(callData.data)

      const answer = await this.peerConnection!.createAnswer()
      await this.peerConnection!.setLocalDescription(answer)

      await this.sendSignal({
        type: "answer",
        callId: callData.callId,
        fromUserId: "",
        toUserId: callData.fromUserId,
        callType: callData.callType,
        data: answer,
      })
    } catch (error) {
      console.error("Error handling offer:", error)
    }
  }

  async handleAnswer(callData: CallData): Promise<void> {
    try {
      await this.peerConnection!.setRemoteDescription(callData.data)
    } catch (error) {
      console.error("Error handling answer:", error)
    }
  }

  async handleIceCandidate(callData: CallData): Promise<void> {
    try {
      await this.peerConnection!.addIceCandidate(callData.data)
    } catch (error) {
      console.error("Error handling ICE candidate:", error)
    }
  }

  async rejectCall(callData: CallData): Promise<void> {
    await this.sendSignal({
      type: "call-reject",
      callId: callData.callId,
      fromUserId: "",
      toUserId: callData.fromUserId,
      callType: callData.callType,
    })
  }

  async endCall(): Promise<void> {
    if (this.currentCallId) {
      await this.sendSignal({
        type: "call-end",
        callId: this.currentCallId,
        fromUserId: "",
        toUserId: "",
        callType: "video",
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

    if (this.onCallEnd) {
      this.onCallEnd()
    }
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }

  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  private async sendSignal(callData: CallData): Promise<void> {
    try {
      const { error } = await this.supabase.from("call_signals").insert({
        call_id: callData.callId,
        signal_type: callData.type,
        from_user_id: callData.fromUserId,
        to_user_id: callData.toUserId,
        call_type: callData.callType,
        signal_data: callData.data,
      })

      if (error) {
        console.error("Error sending signal:", error)
      }
    } catch (error) {
      console.error("Error in sendSignal:", error)
    }
  }

  subscribeToSignals(userId: string, onSignal: (callData: CallData) => void): void {
    this.supabase
      .channel(`call-signals-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_signals",
          filter: `to_user_id=eq.${userId}`,
        },
        (payload: any) => {
          const signal = payload.new
          const callData: CallData = {
            type: signal.signal_type,
            callId: signal.call_id,
            fromUserId: signal.from_user_id,
            toUserId: signal.to_user_id,
            callType: signal.call_type,
            data: signal.signal_data,
          }
          onSignal(callData)
        },
      )
      .subscribe()
  }
}
