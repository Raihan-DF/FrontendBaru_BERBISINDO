"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, FileText, GraduationCap, LayoutDashboard, LogOut, Settings, Trophy } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function StudentSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/student/dashboard",
      icon: LayoutDashboard,
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
      title: "Quiz & Test",
      href: "/student/quizzes",
      icon: GraduationCap,
    },
    {
      title: "Pencapaian",
      href: "/student/achievements",
      icon: Trophy,
    },
    {
      title: "Pengaturan",
      href: "/student/settings",
      icon: Settings,
    },
  ]

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
            <SidebarMenuButton asChild>
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span>Keluar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
