"use client"

import { useState } from "react"
import { LeadsList } from "@/components/leads-list"
import { AccountsList } from "@/components/accounts-list"
import { Header } from "@/components/header"
import { TabBar } from "@/components/tab-bar"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"leads" | "accounts">("leads")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header activeTab={activeTab} />

      <main className="flex-1 overflow-hidden">{activeTab === "leads" ? <LeadsList /> : <AccountsList />}</main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
