import { LoginForm } from "@/components/auth/login-form"
import { Navigation } from "@/components/navigation"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <Navigation />
      <div className="flex items-center justify-center py-12 px-4">
        <LoginForm />
      </div>
    </div>
  )
}
