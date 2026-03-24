"use client"

import { useState, useEffect, useRef } from "react"
import { OpportunityCard } from "@/components/opportunity-card"
import type { Opportunity } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { mockOpportunities } from "@/lib/mock-data"

export function AccountsList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities)
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
    // Simulate API call
    setTimeout(() => {
      // In real app, fetch more data here
      setIsLoading(false)
      setHasMore(false) // No more data for demo
    }, 1000)
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>目前沒有機會</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoading && <Spinner className="h-6 w-6" />}
      </div>
    </div>
  )
}
