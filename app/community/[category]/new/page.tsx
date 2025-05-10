import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewThreadForm } from "@/components/forum/new-thread-form"

export default function NewThreadPage({ params }: { params: { category: string } }) {
  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1).replace(/-/g, " ")

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Create New Thread in {categoryName}</h1>
        <NewThreadForm category={params.category} />
      </div>
    </DashboardLayout>
  )
}
