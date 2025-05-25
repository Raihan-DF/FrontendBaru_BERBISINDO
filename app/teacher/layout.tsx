"use client"

import type React from "react"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { UserNav } from "@/components/user-nav"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <TeacherSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
