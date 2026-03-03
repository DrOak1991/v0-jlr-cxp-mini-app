"use client"

import { Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TabBarProps {
  activeTab: "leads" | "accounts"
  onTabChange: (tab: "leads" | "accounts") => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="sticky bottom-0 z-10 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => onTabChange("leads")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            activeTab === "leads" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs font-medium">商機</span>
        </button>

        <button
          onClick={() => onTabChange("accounts")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            activeTab === "accounts" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Building2 className="h-5 w-5" />
          <span className="text-xs font-medium">帳戶</span>
        </button>
      </div>
    </nav>
  )
}
