"use client"

import { useState, useEffect, useRef } from "react"
import { AccountCard } from "@/components/account-card"
import type { Account } from "@/types"
import { Spinner } from "@/components/ui/spinner"

const mockAccounts: Account[] = [
  {
    id: "1",
    cxpName: "黃建國",
    lineName: "JK Huang",
    lineStatus: "joined",
    phone: "0987-654-321",
    email: "huang.jk@example.com",
    convertedAt: new Date("2024-01-25"),
    avatarUrl: "/asian-professional-man.png",
  },
  {
    id: "2",
    cxpName: "吳佳玲",
    lineName: "Jia Ling",
    lineStatus: "joined",
    phone: "0976-543-210",
    email: "wu.jialing@example.com",
    convertedAt: new Date("2024-02-05"),
    // No avatarUrl - will show initials
  },
  {
    id: "3",
    cxpName: "劉俊傑",
    lineName: undefined,
    lineStatus: "not-joined",
    phone: "0965-432-109",
    email: "jack.liu@example.com",
    convertedAt: new Date("2024-02-12"),
  },
  {
    id: "4",
    cxpName: "陳淑芬",
    lineName: "Sophie Chen",
    lineStatus: "joined",
    phone: "0954-321-098",
    email: "sophie.chen@example.com",
    convertedAt: new Date("2024-02-18"),
    avatarUrl: "/asian-woman-professional.png",
  },
  {
    id: "5",
    cxpName: "周明輝",
    lineName: undefined,
    lineStatus: "not-joined",
    phone: "0943-210-987",
    email: "zhou.mh@example.com",
    convertedAt: new Date("2024-02-20"),
  },
]

export function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts)
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

  if (accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>目前沒有帳戶</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoading && <Spinner className="h-6 w-6" />}
      </div>
    </div>
  )
}
