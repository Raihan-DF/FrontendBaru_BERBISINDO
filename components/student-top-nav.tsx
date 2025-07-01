"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, GraduationCap, Home, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/user-nav";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function StudentTopNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const routes = [
    {
      title: "Dashboard",
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
      href: "/student/progress",
      icon: Trophy,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">BERBISINDO</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              <span>{route.title}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
