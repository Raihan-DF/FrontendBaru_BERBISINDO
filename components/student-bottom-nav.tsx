"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, GraduationCap, Home, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export function StudentBottomNav() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Home",
      href: "/student/dashboard",
      icon: Home,
    },
    {
      title: "Materi",
      href: "/student/materials",
      icon: BookOpen,
    },
    {
      title: "Latihan",
      href: "/student/exercises",
      icon: FileText,
    },
    {
      title: "Quiz",
      href: "/student/quizzes",
      icon: GraduationCap,
    },
    {
      title: "Pencapaian",
      href: "/student/achievements",
      icon: Trophy,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background">
      <div className="grid h-16 grid-cols-5">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors hover:text-primary",
              pathname === route.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className="h-5 w-5" />
            <span>{route.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
