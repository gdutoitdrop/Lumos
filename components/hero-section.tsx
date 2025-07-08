"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, MessageCircle, Shield, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main heading */}
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Mental Health Support Community
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your{" "}
              <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                Support Network
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with others on similar mental health journeys. Share experiences, find support, and build
              meaningful relationships in a safe, understanding community.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600 px-8 py-3 text-lg"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 px-8 py-3 text-lg bg-transparent"
            >
              <Link href="/about-us">Learn More</Link>
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe Community</h3>
                <p className="text-gray-600">
                  Connect with understanding people who share similar experiences and challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Chat</h3>
                <p className="text-gray-600">
                  Message, voice call, and video chat with your matches in a secure environment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your privacy and safety are our top priorities with end-to-end encryption.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Social proof */}
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">4.9/5 from 2,000+ users</span>
            </div>

            <p className="text-gray-500 text-sm">Trusted by thousands of people on their mental health journey</p>
          </div>
        </div>
      </div>
    </div>
  )
}
