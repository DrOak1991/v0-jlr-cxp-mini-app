"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { OpportunityCard } from "@/components/opportunity-card"
import type { Opportunity } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { mockOpportunities, mockAccounts } from "@/lib/mock-data"
import type { OpportunitySearchFilters } from "@/components/opportunity-search-sheet"

interface AccountsListProps {
  filters: OpportunitySearchFilters
}

export function AccountsList({ filters }: AccountsListProps) {
  const [opportunities] = useState<Opportunity[]>(mockOpportunities)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

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

  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities]

    // 關鍵字搜尋：帳戶名稱、機會名稱、手機號碼（從關聯帳戶取得）
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase()
      result = result.filter((opp) => {
        const account = mockAccounts.find((a) => a.id === opp.accountId)
        return (
          opp.accountName?.toLowerCase().includes(q) ||
          opp.name?.toLowerCase().includes(q) ||
          account?.phone?.toLowerCase().includes(q)
        )
      })
    }

    // 機會階段篩選
    if (filters.stageFilter !== "all") {
      result = result.filter((opp) => opp.stage === filters.stageFilter)
    }

    // 主要興趣車款篩選
    if (filters.interestedModelFilter !== "all") {
      result = result.filter((opp) => opp.interestedModel === filters.interestedModelFilter)
    }

    // 排序
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "date-asc":
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        case "name-asc":
          return (a.accountName ?? "").localeCompare(b.accountName ?? "")
        case "name-desc":
          return (b.accountName ?? "").localeCompare(a.accountName ?? "")
        case "date-desc":
        default:
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      }
    })

    return result
  }, [opportunities, filters])

  const isFiltering =
    filters.searchQuery.trim() !== "" ||
    filters.stageFilter !== "all" ||
    filters.interestedModelFilter !== "all"

  if (filteredOpportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <p>{isFiltering ? "沒有符合條件的機會" : "目前沒有機會"}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3 pb-6">
        {filteredOpportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>

      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoading && <Spinner className="h-6 w-6" />}
      </div>
    </div>
  )
}
