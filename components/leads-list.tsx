"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { LeadCard } from "@/components/lead-card"
import type { Lead } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { mockLeads } from "@/lib/mock-data"
import type { LeadSearchFilters } from "@/components/lead-search-sheet"

interface LeadsListProps {
  filters: LeadSearchFilters
}

export function LeadsList({ filters }: LeadsListProps) {
  const router = useRouter()
  const [leads] = useState<Lead[]>(mockLeads)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading])

  const loadMore = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setHasMore(false)
    }, 1000)
  }

  const filteredLeads = useMemo(() => {
    let result = [...leads]

    // 關鍵字搜尋：姓名、手機號碼、Email
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase()
      result = result.filter(
        (lead) =>
          lead.cxpName?.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q) ||
          lead.email?.toLowerCase().includes(q)
      )
    }

    // 商機階段篩選
    if (filters.stageFilter !== "all") {
      result = result.filter((lead) => lead.stage === filters.stageFilter)
    }

    // 主要興趣車款篩選
    if (filters.interestedModelFilter !== "all") {
      result = result.filter((lead) => lead.interestedModel === filters.interestedModelFilter)
    }

    // 排序
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "date-asc":
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        case "name-asc":
          return (a.cxpName ?? "").localeCompare(b.cxpName ?? "")
        case "name-desc":
          return (b.cxpName ?? "").localeCompare(a.cxpName ?? "")
        case "date-desc":
        default:
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      }
    })

    return result
  }, [leads, filters])

  const isFiltering =
    filters.searchQuery.trim() !== "" ||
    filters.stageFilter !== "all" ||
    filters.interestedModelFilter !== "all"

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <p>{isFiltering ? "沒有符合條件的商機" : "目前沒有商機"}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto relative">
      <div className="p-4 space-y-3 pb-24">
        {filteredLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoading && <Spinner className="h-6 w-6" />}
      </div>

      <Button
        type="button"
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => router.push("/lead-create")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
