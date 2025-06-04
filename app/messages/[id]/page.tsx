import { EnhancedMessageThread } from "@/components/messaging/enhanced-message-thread"

interface MessagePageProps {
  params: {
    id: string
  }
}

export default function MessagePage({ params }: MessagePageProps) {
  return <EnhancedMessageThread conversationId={params.id} />
}
