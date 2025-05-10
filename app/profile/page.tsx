import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <ProfileForm />
      </div>
    </DashboardLayout>
  )
}
