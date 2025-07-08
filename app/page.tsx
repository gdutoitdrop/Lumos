import { HeroSection } from "@/components/hero-section"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />

      {/* rest of code here */}
    </div>
  )
}
