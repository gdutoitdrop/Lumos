import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-transparent bg-clip-text">
            Lumos
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/join">Join Lumos</Link>
              </Button>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect, Share, and Heal with{" "}
                  <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-transparent bg-clip-text">
                    Lumos
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  A supportive community for mental health. Find connection, share your journey, and discover resources
                  for your wellbeing.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                  <Link href="/join">Join Lumos</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How Lumos Works</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Our platform is designed to help you connect with others who understand your journey.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 p-4">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Connect</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Find others with similar experiences and build meaningful connections.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 p-4">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Share</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Share your journey in a safe, supportive community that understands.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 p-4">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                      <path d="M12 12 2.1 9.1a10 10 0 0 0 2.8 9.8L12 12Z" />
                      <path d="M12 12 4.9 19.9A10 10 0 0 0 19.8 14L12 12Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Heal</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Access resources and support to help you on your mental health journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 Lumos. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
