import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Heart, Users, MessageCircle, BookOpen, Shield, Sparkles, Moon, ChevronRight } from "lucide-react"
import { HeroSection } from "@/components/hero-section"
import { FeatureCard } from "@/components/feature-card"
import { ProfileDemo } from "@/components/profile-demo"
import { ForumPreview } from "@/components/forum-preview"
import { ResourceHub } from "@/components/resource-hub"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="h-8 w-8 text-rose-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
            Lumos
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-slate-700 hover:text-rose-500 dark:text-slate-200">
            Features
          </Link>
          <Link href="#community" className="text-slate-700 hover:text-rose-500 dark:text-slate-200">
            Community
          </Link>
          <Link href="#resources" className="text-slate-700 hover:text-rose-500 dark:text-slate-200">
            Resources
          </Link>
          <Link href="#about" className="text-slate-700 hover:text-rose-500 dark:text-slate-200">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" className="hidden sm:flex" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white" asChild>
            <Link href="/signup">Join Lumos</Link>
          </Button>
        </div>
      </header>

      <main>
        <HeroSection />

        <section id="features" className="container mx-auto py-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How Lumos Works</h2>
          <p className="text-slate-600 dark:text-slate-300 text-center max-w-2xl mx-auto mb-16">
            Reimagining social connections with emotional wellbeing, intentional design, and authentic connection at the
            core.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Heart className="h-8 w-8 text-rose-500" />}
              title="Date & Connect Modes"
              description="Choose between romantic or platonic connections with clear intentions and expectations."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-amber-500" />}
              title="Mood-Aware Algorithm"
              description="Our matching considers compatibility, shared values, and current emotional states for empathetic connections."
            />
            <FeatureCard
              icon={<MessageCircle className="h-8 w-8 text-emerald-500" />}
              title="Tone-Sensitive Messaging"
              description="AI-assisted communication helps reframe messages with kindness and clarity during stressful moments."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-500" />}
              title="Community Forums"
              description="Safe, moderated spaces to share stories, seek advice, and connect with others who understand."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-purple-500" />}
              title="Resource Hub"
              description="Curated mental health content, coping tools, and crisis resources to support your wellbeing journey."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-slate-500" />}
              title="Safety First"
              description="Comprehensive reporting tools, profile verification, and check-in functions to ensure a safe experience."
            />
          </div>
        </section>

        <section className="bg-rose-50 dark:bg-slate-800 py-20 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Express Your Authentic Self</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Create rich, expressive profiles that go beyond surface-level bios with prompts that invite
                  reflection, compassion, and honesty.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                    Create Your Profile
                  </Button>
                  <Button variant="outline">See Examples</Button>
                </div>
              </div>
              <div className="md:w-1/2">
                <ProfileDemo />
              </div>
            </div>
          </div>
        </section>

        <section id="community" className="container mx-auto py-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Community Forum</h2>
          <p className="text-slate-600 dark:text-slate-300 text-center max-w-2xl mx-auto mb-16">
            A safe, moderated space where users can share stories, ask for advice, post uplifting content, or simply
            connect with others who "get it."
          </p>

          <ForumPreview />

          <div className="text-center mt-12">
            <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
              Explore All Forums <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        <section id="resources" className="bg-amber-50 dark:bg-slate-800 py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Resource Hub</h2>
            <p className="text-slate-600 dark:text-slate-300 text-center max-w-2xl mx-auto mb-16">
              Access curated mental health content, coping tools, breathing exercises, journaling prompts, and links to
              crisis resources.
            </p>

            <ResourceHub />
          </div>
        </section>

        <section className="container mx-auto py-20 px-4">
          <div className="bg-gradient-to-r from-rose-100 to-amber-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-slate-700 dark:text-slate-200 max-w-2xl mx-auto mb-8">
              Lumos isn't just another app—it's a social sanctuary where vulnerability is strength, and connection is
              grounded in empathy.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 text-white" asChild>
              <Link href="/signup">Get Started Today</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
