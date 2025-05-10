import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ThreadView } from "@/components/forum/thread-view"

export default function ThreadPage({ params }: { params: { slug: string; threadId: string } }) {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <ThreadView category={params.slug} threadId={params.threadId} />
      </div>
    </DashboardLayout>
  )
}
