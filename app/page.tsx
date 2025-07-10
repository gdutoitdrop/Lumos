import { HeroSection } from "@/components/hero-section"
import { FeatureCard } from "@/components/feature-card"
import { ProfileDemo } from "@/components/profile-demo"
import { ForumPreview } from "@/components/forum-preview"
import { ResourceHub } from "@/components/resource-hub"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <HeroSection />

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Lumos Helps You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="Heart"
              title="Find Your Match"
              description="Connect with others who understand your journey and share similar experiences."
            />
            <FeatureCard
              icon="Users"
              title="Supportive Community"
              description="Join forums and groups focused on specific mental health topics and challenges."
            />
            <FeatureCard
              icon="LineChart"
              title="Track Your Mood"
              description="Monitor your emotional wellbeing and identify patterns to better manage your mental health."
            />
            <FeatureCard
              icon="BookOpen"
              title="Resource Hub"
              description="Access curated articles, videos, and tools to support your mental health journey."
            />
          </div>
        </div>
      </section>

      <ProfileDemo />
      <ForumPreview />
      <ResourceHub />
      <Footer />
    </div>
  )
}
