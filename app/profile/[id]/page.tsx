import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PublicProfile } from "@/components/profile/public-profile"

export default function UserProfilePage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <PublicProfile userId={params.id} />
      </div>
    </DashboardLayout>
  )
}
