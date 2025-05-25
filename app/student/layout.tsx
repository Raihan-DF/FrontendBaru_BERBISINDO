"use client"

import type React from "react"
import { StudentBottomNav } from "@/components/student-bottom-nav"
import { StudentTopNav } from "@/components/student-top-nav"
import { useIsMobile } from "@/hooks/use-mobile"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!isMobile && <StudentTopNav />}
      <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      {isMobile && <StudentBottomNav />}
    </div>
  )
}
