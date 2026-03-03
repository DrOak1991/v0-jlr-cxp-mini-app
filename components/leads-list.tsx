"use client"

import { useState, useEffect, useRef } from "react"
import { LeadCard } from "@/components/lead-card"
import type { Lead } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { mockLeads } from "@/lib/mock-data"

export function LeadsList() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
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

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>目前沒有商機</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto relative">
      <div className="p-4 space-y-3 pb-24">
        {leads.map((lead) => (
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
