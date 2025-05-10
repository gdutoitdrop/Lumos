"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Home, MessageSquare, Users, Heart, BookOpen, Settings, Crown } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  isPremium?: boolean
}

export function DashboardNav() {
  const pathname = usePathname()
  const { user, isPremium } = useAuth()

  const navItems: NavItem[] = [
    {
      title: "Home",
      href: "/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      title: "Matching",
      href: "/matching",
      icon: <Heart className="mr-2 h-4 w-4" />,
    },
    {
      title: "Community",
      href: "/community",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Resources",
      href: "/resources",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      title: "Premium",
      href: "/premium",
      icon: <Crown className="mr-2 h-4 w-4" />,
      isPremium: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid gap-2 p-2">
      {navItems.map((item) => {
        // Skip premium items for non-premium users
        if (item.isPremium && !isPremium) return null

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
