"use client"

import type { Opportunity } from "@/types"
import { Card } from "@/components/ui/card"
import { ArrowRight, Car, Building2, TrendingUp, CheckCircle2, XCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface OpportunityCardProps {
  opportunity: Opportunity
}

const stageLabels: Record<string, string> = {
  "prospecting": "探索中",
  "qualification": "資格確認",
  "needs-analysis": "需求分析",
  "proposal": "提案中",
  "negotiation": "議價中",
  "closed-won": "已成交",
  "closed-lost": "已流失",
}

const stageColors: Record<string, string> = {
  "prospecting": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "qualification": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "needs-analysis": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "proposal": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "negotiation": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "closed-won": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "closed-lost": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/opportunities/${opportunity.id}`)
  }

  const getStageIcon = () => {
    if (opportunity.stage === "closed-won") {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    }
    if (opportunity.stage === "closed-lost") {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
    return <TrendingUp className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleCardClick}>
      <div className="space-y-3">
        {/* Header: 機會名稱 + 階段 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base truncate">{opportunity.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>帳戶：{opportunity.accountName}</span>
            </div>
          </div>
          <Badge variant="secondary" className={`shrink-0 ${stageColors[opportunity.stage]}`}>
            {stageLabels[opportunity.stage]}
          </Badge>
        </div>

        {/* 車型資訊 */}
        <div className="flex items-center gap-2 text-sm">
          <Car className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{opportunity.interestedModel || "未指定車款"}</span>
          {opportunity.carType && (
            <span className="text-muted-foreground">
              ({opportunity.carType === "new-car" ? "新車" : "認證中古車"})
            </span>
          )}
        </div>

        {/* 可能性 + 日期 */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            {opportunity.probability !== undefined && (
              <div className="flex items-center gap-1.5 text-sm">
                {getStageIcon()}
                <span className={`font-medium ${
                  opportunity.stage === "closed-won" ? "text-green-600" :
                  opportunity.stage === "closed-lost" ? "text-red-600" :
                  "text-foreground"
                }`}>
                  {opportunity.probability}%
                </span>
              </div>
            )}
            {opportunity.orderDate && (
              <span className="text-xs text-muted-foreground">
                訂單：{formatDate(opportunity.orderDate)}
              </span>
            )}
            {opportunity.deliveryDate && (
              <span className="text-xs text-muted-foreground">
                交車：{formatDate(opportunity.deliveryDate)}
              </span>
            )}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </div>
    </Card>
  )
}
