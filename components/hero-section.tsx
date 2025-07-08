"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, MessageCircle, Shield, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-full">
          <Heart className="h-6 w-6 text-rose-500" />
        </div>
      </div>
      <div className="absolute top-32 right-16 animate-float-delayed">
        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
          <Users className="h-6 w-6 text-amber-500" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 animate-float">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
          <MessageCircle className="h-6 w-6 text-blue-500" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-rose-100 to-amber-100 text-slate-700 border-0"
          >
            <Shield className="h-4 w-4 mr-2" />
            Safe • Supportive • Confidential
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-rose-600 to-amber-600 bg-clip-text text-transparent dark:from-white dark:via-rose-400 dark:to-amber-400">
            Find Your Light in the Journey
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with others who understand your mental health journey. Share experiences, find support, and discover
            that you're never alone.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">10K+</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">95%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Feel Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Community Support</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-300 dark:border-slate-600 px-8 py-4 text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 bg-transparent"
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch How It Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm">4.9/5 from 2,000+ reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">How Lumos Works</h3>
              <Button variant="ghost" onClick={() => setIsVideoPlaying(false)}>
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">Video coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
