import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewThreadForm } from "@/components/forum/new-thread-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewThreadPage({ params }: { params: { slug: string } }) {
  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, " ")

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <Link
          href={`/community/${params.slug}`}
          className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {categoryName}
        </Link>

        <h1 className="text-3xl font-bold mb-6">Create a New Thread</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Share your thoughts, questions, or experiences with the {categoryName.toLowerCase()} community.
        </p>

        <NewThreadForm categorySlug={params.slug} />
      </div>
    </DashboardLayout>
  )
}
