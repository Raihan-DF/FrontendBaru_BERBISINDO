"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, FileText, GraduationCap, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"

export function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const routes = [
    {
      title: "Dashboard",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Materi",
      href: "/teacher/materials",
      icon: BookOpen,
    },
    {
      title: "Latihan",
      href: "/teacher/exercises",
      icon: FileText,
    },
    {
      title: "Quiz & Test",
      href: "/teacher/quizzes",
      icon: GraduationCap,
    },
    {
      title: "Pemantauan Siswa",
      href: "/teacher/students",
      icon: Users,
    },
    {
      title: "Pengaturan",
      href: "/teacher/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      // Router.push akan ditangani oleh fungsi logout di AuthContext
    } catch (error) {
      console.error("Gagal logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">BISINDO</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                <Link href={route.href}>
                  <route.icon className="h-5 w-5" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Keluar">
              <button onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-2">
                <LogOut className="h-5 w-5" />
                <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
