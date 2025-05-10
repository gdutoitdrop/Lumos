"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, MessageCircle, Heart, Settings, BookOpen, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Matches",
    href: "/matches",
    icon: Heart,
  },
  {
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === "admin"

  return (
    <nav className="grid gap-2 p-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", pathname === item.href && "bg-slate-100 dark:bg-slate-800")}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}

      {isAdmin && (
        <Link href="/admin/dashboard">
          <Button
            variant="ghost"
            className={cn("w-full justify-start", pathname === "/admin/dashboard" && "bg-slate-100 dark:bg-slate-800")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Admin
          </Button>
        </Link>
      )}

      <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </nav>
  )
}
