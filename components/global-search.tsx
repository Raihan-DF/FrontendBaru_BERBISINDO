// components/global-search.tsx
"use client"

import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GlobalSearch() {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari..."
        className="w-[200px] pl-8"
      />
    </div>
  )
}