"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Building2,
  Car,
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PhoneCall,
  MailIcon,
} from "lucide-react"
import type { Opportunity, Account, Activity } from "@/types"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getOpportunityById, getActivitiesByOpportunityId, getAccountById } from "@/lib/mock-data"

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

const taskStatusLabels: Record<string, string> = {
  "not-started": "未開始",
  "in-progress": "進行中",
  "completed": "已完成",
  "waiting": "等待中",
  "deferred": "已延期",
}

export default function OpportunityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const opportunityData = getOpportunityById(params.id as string)
  const activitiesData = getActivitiesByOpportunityId(params.id as string)
  const accountData = opportunityData ? getAccountById(opportunityData.accountId) : undefined

  const [isEditing, setIsEditing] = useState(false)
  const [opportunity, setOpportunity] = useState<Opportunity>(opportunityData || ({} as Opportunity))
  const [originalOpportunity, setOriginalOpportunity] = useState<Opportunity>(opportunityData || ({} as Opportunity))
  const [account, setAccount] = useState<Account | undefined>(accountData)
  const [activities, setActivities] = useState<Activity[]>(activitiesData)
  const [hasFieldsChanged, setHasFieldsChanged] = useState(false)

  // Lost dialog
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false)
  const [lostReason, setLostReason] = useState("")

  useEffect(() => {
    const newOpportunityData = getOpportunityById(params.id as string)
    const newActivitiesData = getActivitiesByOpportunityId(params.id as string)
    const newAccountData = newOpportunityData ? getAccountById(newOpportunityData.accountId) : undefined

    if (newOpportunityData) {
      setOpportunity(newOpportunityData)
      setOriginalOpportunity(newOpportunityData)
    }
    setActivities(newActivitiesData)
    setAccount(newAccountData)
  }, [params.id])

  useEffect(() => {
    const changed = JSON.stringify(opportunity) !== JSON.stringify(originalOpportunity)
    setHasFieldsChanged(changed)
  }, [opportunity, originalOpportunity])

  const handleSave = () => {
    // Check if stage changed to closed-lost
    if (opportunity.stage === "closed-lost" && originalOpportunity.stage !== "closed-lost") {
      setIsLostDialogOpen(true)
      return
    }

    performSave()
  }

  const performSave = () => {
    setOriginalOpportunity({ ...opportunity })
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "資料已更新",
      description: "機會資訊已成功儲存",
    })
  }

  const handleLostSave = () => {
    if (!lostReason.trim()) {
      toast({
        title: "請輸入原因",
        description: "請說明機會流失的原因",
        variant: "destructive",
      })
      return
    }

    const updatedOpportunity = { ...opportunity, lostReason: lostReason.trim(), probability: 0 }
    setOpportunity(updatedOpportunity)
    setOriginalOpportunity({ ...updatedOpportunity })
    setIsLostDialogOpen(false)
    setLostReason("")
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "資料已更新",
      description: "機會已標記為流失",
    })
  }

  const handleCancel = () => {
    setOpportunity({ ...originalOpportunity })
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "編輯已取消",
      description: "您的變更已取消",
    })
  }

  const handleCall = () => {
    if (account?.phone) {
      window.location.href = `tel:+886${account.phone}`
    }
  }

  const handleEmail = () => {
    if (account?.email) {
      window.location.href = `mailto:${account.email}`
    }
  }

  const navigateToAccount = () => {
    if (account) {
      router.push(`/accounts/${account.id}`)
    }
  }

  if (!opportunityData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">找不到此機會</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">機會詳情</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isEditing && hasFieldsChanged) {
              handleSave()
            } else {
              setIsEditing(!isEditing)
            }
          }}
        >
          {isEditing ? (
            hasFieldsChanged ? (
              <span className="text-primary font-medium text-sm">儲存</span>
            ) : (
              <span className="text-muted-foreground font-medium text-sm">完成</span>
            )
          ) : (
            <Edit className="h-5 w-5" />
          )}
        </Button>
      </header>

      {/* Cancel bar when editing */}
      {isEditing && (
        <div className="px-4 py-2 bg-muted/50 border-b">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground">
            取消編輯
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {/* 基本資訊卡片 */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* 機會名稱 + 階段 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h2 className="font-semibold text-xl">{opportunity.name}</h2>
                <div
                  className="flex items-center gap-1.5 mt-1 text-sm text-primary cursor-pointer hover:underline"
                  onClick={navigateToAccount}
                >
                  <Building2 className="h-4 w-4" />
                  <span>帳戶：{opportunity.accountName}</span>
                </div>
              </div>
              <Badge variant="secondary" className={stageColors[opportunity.stage]}>
                {stageLabels[opportunity.stage]}
              </Badge>
            </div>

            {/* 快速操作按鈕 */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCall}>
                <PhoneCall className="h-4 w-4 mr-2" />
                撥打
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleEmail}>
                <MailIcon className="h-4 w-4 mr-2" />
                郵件
              </Button>
            </div>

            {/* 機會狀態 */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">機會階段</span>
                  {isEditing ? (
                    <Select
                      value={opportunity.stage}
                      onValueChange={(value) => setOpportunity({ ...opportunity, stage: value as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="選擇階段" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecting">探索中</SelectItem>
                        <SelectItem value="qualification">資格確認</SelectItem>
                        <SelectItem value="needs-analysis">需求分析</SelectItem>
                        <SelectItem value="proposal">提案中</SelectItem>
                        <SelectItem value="negotiation">議價中</SelectItem>
                        <SelectItem value="closed-won">已成交</SelectItem>
                        <SelectItem value="closed-lost">已流失</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground font-medium">{stageLabels[opportunity.stage]}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">可能性</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={opportunity.probability || 0}
                      onChange={(e) => setOpportunity({ ...opportunity, probability: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{opportunity.probability ?? 0}%</p>
                  )}
                </div>
              </div>

              {/* 訂單日期 */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">訂單日期</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={opportunity.orderDate ? opportunity.orderDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => setOpportunity({ ...opportunity, orderDate: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    />
                  ) : (
                    <p className="text-foreground">{opportunity.orderDate ? formatDate(opportunity.orderDate) : "未設定"}</p>
                  )}
                </div>
              </div>

              {/* 交車日期 */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">交車日期</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={opportunity.deliveryDate ? opportunity.deliveryDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => setOpportunity({ ...opportunity, deliveryDate: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    />
                  ) : (
                    <p className="text-foreground">{opportunity.deliveryDate ? formatDate(opportunity.deliveryDate) : "未設定"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 流失原因區塊 */}
        {opportunity.stage === "closed-lost" && (
          <Card className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              流失原因
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              {opportunity.lostReason || "未記錄流失原因"}
            </p>
          </Card>
        )}

        {/* 車型選擇卡片 */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Car className="h-5 w-5" />
            車型選擇
          </h3>

          {/* 購車方式 */}
          <div>
            <Label className="text-sm text-muted-foreground">購車方式</Label>
            {isEditing ? (
              <Select
                value={opportunity.carType || ""}
                onValueChange={(value) => setOpportunity({ ...opportunity, carType: value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-car">新車</SelectItem>
                  <SelectItem value="certified-used">認證中古車</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.carType === "new-car" ? "新車" : opportunity.carType === "certified-used" ? "認證中古車" : "未設定"}
              </p>
            )}
          </div>

          {/* 詳細分類 */}
          <div>
            <Label className="text-sm text-muted-foreground">詳細分類</Label>
            {isEditing ? (
              <Select
                value={opportunity.detailCategory || ""}
                onValueChange={(value) => setOpportunity({ ...opportunity, detailCategory: value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="fleet">Fleet</SelectItem>
                  <SelectItem value="approved-pre-owned">Approved Pre-Owned</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.detailCategory === "retail" ? "Retail"
                  : opportunity.detailCategory === "fleet" ? "Fleet"
                  : opportunity.detailCategory === "approved-pre-owned" ? "Approved Pre-Owned"
                  : "未設定"}
              </p>
            )}
          </div>

          {/* 主要興趣車款 */}
          <div>
            <Label className="text-sm text-muted-foreground">主要興趣車款</Label>
            {isEditing ? (
              <Input
                value={opportunity.interestedModel || ""}
                onChange={(e) => setOpportunity({ ...opportunity, interestedModel: e.target.value })}
                placeholder="請輸入車款"
                className="mt-1"
              />
            ) : (
              <p className="text-foreground mt-1">{opportunity.interestedModel || "未設定"}</p>
            )}
          </div>

          {/* 動力型式 */}
          <div>
            <Label className="text-sm text-muted-foreground">動力型式</Label>
            {isEditing ? (
              <Select
                value={opportunity.powerType || ""}
                onValueChange={(value) => setOpportunity({ ...opportunity, powerType: value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">汽油</SelectItem>
                  <SelectItem value="diesel">柴油</SelectItem>
                  <SelectItem value="electric">純電</SelectItem>
                  <SelectItem value="hybrid">混合動力</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.powerType === "gasoline" ? "汽油"
                  : opportunity.powerType === "diesel" ? "柴油"
                  : opportunity.powerType === "electric" ? "純電"
                  : opportunity.powerType === "hybrid" ? "混合動力"
                  : "未設定"}
              </p>
            )}
          </div>

          {/* SV/V8 偏好 */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">顧客想購買 SV / V8 車款</Label>
            {isEditing ? (
              <Switch
                checked={opportunity.performancePreference || false}
                onCheckedChange={(checked) => setOpportunity({ ...opportunity, performancePreference: checked })}
              />
            ) : (
              <p className="text-foreground">{opportunity.performancePreference ? "是" : "否"}</p>
            )}
          </div>
        </Card>

        {/* 轉換資訊卡片 */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">轉換資訊</h3>

          {/* 商機來源 */}
          <div>
            <Label className="text-sm text-muted-foreground">商機來源</Label>
            {isEditing ? (
              <Select
                value={opportunity.leadSource || ""}
                onValueChange={(value) => setOpportunity({ ...opportunity, leadSource: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">來店客 (Walk-in)</SelectItem>
                  <SelectItem value="referral">轉介 (Referral)</SelectItem>
                  <SelectItem value="retailer-experience">經銷商外展 / 體驗活動</SelectItem>
                  <SelectItem value="existing-customer">既有客戶</SelectItem>
                  <SelectItem value="phone-in">來電客</SelectItem>
                  <SelectItem value="line-booking">網路客預約 (LINE)</SelectItem>
                  <SelectItem value="field-visit">陌生開發</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.leadSource === "walk-in" ? "來店客 (Walk-in)"
                  : opportunity.leadSource === "referral" ? "轉介 (Referral)"
                  : opportunity.leadSource === "retailer-experience" ? "經銷商外展 / 體驗活動"
                  : opportunity.leadSource === "existing-customer" ? "既有客戶"
                  : opportunity.leadSource === "phone-in" ? "來電客"
                  : opportunity.leadSource === "line-booking" ? "網路客預約 (LINE)"
                  : opportunity.leadSource === "field-visit" ? "陌生開發"
                  : "未設定"}
              </p>
            )}
          </div>

          {/* 現有車輛品牌 */}
          <div>
            <Label className="text-sm text-muted-foreground">現有車輛品牌</Label>
            {isEditing ? (
              <Input
                value={opportunity.existingCarBrand || ""}
                onChange={(e) => setOpportunity({ ...opportunity, existingCarBrand: e.target.value })}
                placeholder="請輸入品牌"
                className="mt-1"
              />
            ) : (
              <p className="text-foreground mt-1">{opportunity.existingCarBrand || "未設定"}</p>
            )}
          </div>

          {/* 現有車輛 */}
          <div>
            <Label className="text-sm text-muted-foreground">現有車輛</Label>
            {isEditing ? (
              <Input
                value={opportunity.existingCarModel || ""}
                onChange={(e) => setOpportunity({ ...opportunity, existingCarModel: e.target.value })}
                placeholder="請輸入車款"
                className="mt-1"
              />
            ) : (
              <p className="text-foreground mt-1">{opportunity.existingCarModel || "未設定"}</p>
            )}
          </div>
        </Card>

        {/* 帳戶資訊卡片 */}
        {account && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                帳戶資訊
              </h3>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto" onClick={navigateToAccount}>
                查看帳戶詳情
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">帳戶名稱</span>
                <p className="text-foreground font-medium">{account.cxpName}</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">行動電話</span>
                  <p className="text-foreground">886 {account.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">電子郵件</span>
                  <p className="text-foreground">{account.email || "未設定"}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 活動記錄卡片 */}
        <Card className="p-4">
          <h3 className="font-semibold text-base mb-4">活動記錄</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">目前沒有活動記錄</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "event" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                    {activity.type === "event" ? (
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.subject}</p>
                    {activity.type === "task" && activity.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {activity.type === "event" ? (
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(activity.startDateTime)}
                        </span>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">
                            截止：{formatDate(activity.dueDate)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            activity.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : activity.status === "in-progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {taskStatusLabels[activity.status]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Lost Dialog */}
      <Dialog open={isLostDialogOpen} onOpenChange={setIsLostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>機會流失原因</DialogTitle>
            <DialogDescription>請說明此機會流失的原因</DialogDescription>
          </DialogHeader>
          <Textarea
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="請輸入流失原因..."
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLostDialogOpen(false)} className="bg-transparent">
              取消
            </Button>
            <Button onClick={handleLostSave}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
