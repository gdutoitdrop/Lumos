import { Button } from "@/components/ui/button"
import { Heart, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="container mx-auto py-20 px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              Meaningful connections
            </span>{" "}
            for mental wellbeing
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 max-w-xl">
            An inclusive, stigma-free platform created for individuals navigating mental health challenges who seek
            meaningful, safe, and emotionally resonant social connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 text-white" asChild>
              <Link href="/signup">
                <Heart className="mr-2 h-5 w-5" /> Date Mode
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">
                <Users className="mr-2 h-5 w-5" /> Connect Mode
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <p className="text-slate-500 dark:text-slate-400">Already a member?</p>
            <Button variant="link" className="text-rose-500 p-0" asChild>
              <Link href="/login">
                Sign in <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-64 h-64 bg-rose-200 dark:bg-rose-900/30 rounded-full filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-amber-200 dark:bg-amber-900/30 rounded-full filter blur-3xl opacity-70"></div>
            <img
              src="/placeholder.svg?height=600&width=600"
              alt="People connecting through Lumos"
              className="relative z-10 rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
