"use client"

import { useState } from "react"
import { LeadsList } from "@/components/leads-list"
import { AccountsList } from "@/components/accounts-list"
import { Header } from "@/components/header"
import { TabBar } from "@/components/tab-bar"
import type { LeadSearchFilters } from "@/components/lead-search-sheet"
import type { OpportunitySearchFilters } from "@/components/opportunity-search-sheet"

const defaultLeadFilters: LeadSearchFilters = {
  searchQuery: "",
  stageFilter: "all",
  interestedModelFilter: "all",
  sortBy: "date-desc",
}

const defaultOpportunityFilters: OpportunitySearchFilters = {
  searchQuery: "",
  stageFilter: "all",
  interestedModelFilter: "all",
  sortBy: "date-desc",
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"leads" | "accounts">("leads")
  const [leadFilters, setLeadFilters] = useState<LeadSearchFilters>(defaultLeadFilters)
  const [opportunityFilters, setOpportunityFilters] = useState<OpportunitySearchFilters>(defaultOpportunityFilters)

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        activeTab={activeTab}
        onLeadFilter={setLeadFilters}
        onOpportunityFilter={setOpportunityFilters}
        leadFilters={leadFilters}
        opportunityFilters={opportunityFilters}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === "leads" ? (
          <LeadsList filters={leadFilters} />
        ) : (
          <AccountsList filters={opportunityFilters} />
        )}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
