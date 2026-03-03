"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  type: "leads" | "accounts"
}

export function SearchFilterSheet({ isOpen, onClose, type }: SearchFilterSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("date-desc")

  if (!isOpen) return null

  const handleApply = () => {
    // TODO: Apply search and filter
    console.log("[v0] Apply search/filter:", { searchQuery, stageFilter, sortBy, type })
    onClose()
  }

  const handleReset = () => {
    setSearchQuery("")
    setStageFilter("all")
    setSortBy("date-desc")
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-x-0 top-0 z-50 bg-background rounded-b-xl shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">搜尋與篩選</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              搜尋
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="搜尋姓名、電話或 Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <div className="space-y-2">
            <Label htmlFor="stage" className="text-sm font-medium">
              階段
            </Label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger id="stage">
                <SelectValue placeholder="全部階段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部階段</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="follow-up">Follow up</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label htmlFor="sort" className="text-sm font-medium">
              排序方式
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  {type === "leads" ? "建檔時間（新到舊）" : "轉換時間（新到舊）"}
                </SelectItem>
                <SelectItem value="date-asc">
                  {type === "leads" ? "建檔時間（舊到新）" : "轉換時間（舊到新）"}
                </SelectItem>
                <SelectItem value="name-asc">姓名（A-Z）</SelectItem>
                <SelectItem value="name-desc">姓名（Z-A）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleReset}>
              重置
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              套用
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
