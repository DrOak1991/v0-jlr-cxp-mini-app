"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface LeadSearchFilters {
  searchQuery: string
  stageFilter: string
  interestedModelFilter: string
  sortBy: string
}

interface LeadSearchSheetProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: LeadSearchFilters) => void
  filters: LeadSearchFilters
}

export function LeadSearchSheet({ isOpen, onClose, onApply, filters }: LeadSearchSheetProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery)
  const [stageFilter, setStageFilter] = useState(filters.stageFilter)
  const [interestedModelFilter, setInterestedModelFilter] = useState(filters.interestedModelFilter)
  const [sortBy, setSortBy] = useState(filters.sortBy)

  if (!isOpen) return null

  const handleApply = () => {
    onApply({ searchQuery, stageFilter, interestedModelFilter, sortBy })
    onClose()
  }

  const handleReset = () => {
    setSearchQuery("")
    setStageFilter("all")
    setInterestedModelFilter("all")
    setSortBy("date-desc")
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 top-0 z-50 bg-background rounded-b-xl shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">搜尋與篩選</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* 搜尋 */}
          <div className="space-y-2">
            <Label htmlFor="lead-search" className="text-sm font-medium">搜尋</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lead-search"
                placeholder="搜尋姓名、手機號碼或 Email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 商機階段 */}
          <div className="space-y-2">
            <Label htmlFor="lead-stage" className="text-sm font-medium">商機階段</Label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger id="lead-stage">
                <SelectValue placeholder="全部階段" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部階段</SelectItem>
                <SelectItem value="new">新增（尚未聯繫）</SelectItem>
                <SelectItem value="follow-up">已聯繫並持續跟進</SelectItem>
                <SelectItem value="qualified">合格</SelectItem>
                <SelectItem value="lost">戰敗</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 主要興趣車款 */}
          <div className="space-y-2">
            <Label htmlFor="lead-model" className="text-sm font-medium">主要興趣車款</Label>
            <Select value={interestedModelFilter} onValueChange={setInterestedModelFilter}>
              <SelectTrigger id="lead-model">
                <SelectValue placeholder="全部車款" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部車款</SelectItem>
                <SelectItem value="Defender 90">Defender 90</SelectItem>
                <SelectItem value="Defender 110">Defender 110</SelectItem>
                <SelectItem value="Defender 130">Defender 130</SelectItem>
                <SelectItem value="Range Rover">Range Rover</SelectItem>
                <SelectItem value="Range Rover Sport">Range Rover Sport</SelectItem>
                <SelectItem value="Range Rover Velar">Range Rover Velar</SelectItem>
                <SelectItem value="Range Rover Evoque">Range Rover Evoque</SelectItem>
                <SelectItem value="Discovery">Discovery</SelectItem>
                <SelectItem value="Discovery Sport">Discovery Sport</SelectItem>
                <SelectItem value="F-PACE">F-PACE</SelectItem>
                <SelectItem value="E-PACE">E-PACE</SelectItem>
                <SelectItem value="I-PACE">I-PACE</SelectItem>
                <SelectItem value="F-TYPE">F-TYPE</SelectItem>
                <SelectItem value="XF">XF</SelectItem>
                <SelectItem value="XE">XE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 排序方式 */}
          <div className="space-y-2">
            <Label htmlFor="lead-sort" className="text-sm font-medium">排序方式</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="lead-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">建檔時間（新到舊）</SelectItem>
                <SelectItem value="date-asc">建檔時間（舊到新）</SelectItem>
                <SelectItem value="name-asc">姓名（A-Z）</SelectItem>
                <SelectItem value="name-desc">姓名（Z-A）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-3 pt-2">
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
