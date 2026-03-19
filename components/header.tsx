"use client"

import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { SearchFilterSheet } from "@/components/search-filter-sheet"

interface HeaderProps {
  activeTab: "leads" | "accounts"
}

export function Header({ activeTab }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-semibold text-foreground">{activeTab === "leads" ? "商機" : "帳戶/機會"}</h1>

          <Button variant="ghost" size="icon" className="text-foreground" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <SearchFilterSheet isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} type={activeTab} />
    </>
  )
}
