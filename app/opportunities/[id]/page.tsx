"use client"

import type React from "react"
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
  MessageCircle,
  UserX,
  Copy,
  Check,
  Upload,
  Plus,
  ClipboardList,
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePicker } from "@/components/date-picker"
import type { Opportunity, Account, Activity, TestDriveConsent } from "@/types"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getOpportunityById, getActivitiesByOpportunityId, getAccountById } from "@/lib/mock-data"
import { ActivityRecord } from "@/components/activity-record"
import { TestDriveConsentCard } from "@/components/test-drive-consent-card"

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
  const [testDriveConsent, setTestDriveConsent] = useState<TestDriveConsent | null>(null)

  // Lost dialog
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false)
  const [lostReason, setLostReason] = useState("")

  // Invite sheet states
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const inviteUrl = `https://example.com/invite/${account?.id}`
  const defaultInviteMessage = `歡迎點擊以下連結，加入 Jaguar Land Rover 的官方帳號，獲得專屬活動資訊、並享受完整的體驗與支援服務。`
  const [inviteMessage, setInviteMessage] = useState(defaultInviteMessage)
  
  // Activity sheet states
  const [isNewActivitySheetOpen, setIsNewActivitySheetOpen] = useState(false)
  const [activityType, setActivityType] = useState<"event" | "task">("event")
  const [newActivity, setNewActivity] = useState({
    subject: "",
    description: "",
    startDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    dueDate: undefined as Date | undefined,
    status: "not-started" as "not-started" | "in-progress" | "completed",
  })

  // Test drive invite states
  const [testDriveStep, setTestDriveStep] = useState<"form" | "qrcode">("form")
  const [testDriveDate, setTestDriveDate] = useState("")
  const [testDriveTime, setTestDriveTime] = useState("")
  const [testDriveBrand, setTestDriveBrand] = useState("")
  const [testDriveModel, setTestDriveModel] = useState("")
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<string | null>(null)
  const [licenseBackPreview, setLicenseBackPreview] = useState<string | null>(null)

  const brandModels: Record<string, string[]> = {
    "Jaguar": ["F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XF", "XE"],
    "Land Rover": ["Defender 90", "Defender 110", "Defender 130", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Discovery", "Discovery Sport"]
  }

  useEffect(() => {
    if (isInviteSheetOpen) {
      setInviteMessage(defaultInviteMessage)
      setCopied(false)
      setTestDriveStep("form")
      setTestDriveDate("")
      setTestDriveTime("")
      setTestDriveBrand("")
      setTestDriveModel("")
      setLicenseFrontPreview(null)
      setLicenseBackPreview(null)
    }
  }, [isInviteSheetOpen, defaultInviteMessage])

  useEffect(() => {
    if (isNewActivitySheetOpen) {
      setActivityType("event")
      setNewActivity({
        subject: "",
        description: "",
        startDate: undefined,
        startTime: "",
        endTime: "",
        dueDate: undefined,
        status: "not-started",
      })
    }
  }, [isNewActivitySheetOpen])

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

  const handleInvite = () => {
    setIsInviteSheetOpen(true)
  }

  const handleCreateTestDriveQR = () => {
    setTestDriveStep("qrcode")
  }

  const handleEditTestDrive = () => {
    setTestDriveStep("form")
  }

  const handleLicenseFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setLicenseFrontPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleLicenseBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setLicenseBackPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const formatTestDriveDateTime = () => {
    if (!testDriveDate || !testDriveTime) return ""
    const date = new Date(`${testDriveDate}T${testDriveTime}`)
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).replace(/\//g, "/")
  }

  const handleCopyMessage = async () => {
    try {
      const fullMessage = `${inviteMessage}\n${inviteUrl}`
      await navigator.clipboard.writeText(fullMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveActivity = () => {
    if (!newActivity.subject.trim()) {
      toast({
        title: "請輸入主題",
        description: activityType === "event" ? "請輸入事件主題" : "請輸入工作主題",
        variant: "destructive",
      })
      return
    }

    if (activityType === "event" && (!newActivity.startDate || !newActivity.startTime)) {
      toast({
        title: "請選擇日期與時間",
        description: "請選擇事件的開始日期與時間",
        variant: "destructive",
      })
      return
    }

    if (activityType === "task" && !newActivity.dueDate) {
      toast({
        title: "請選擇截止日期",
        description: "請選擇工作的截止日期",
        variant: "destructive",
      })
      return
    }

    // Create new activity (mock)
    const activity: Activity = {
      id: `new-${Date.now()}`,
      type: activityType,
      subject: newActivity.subject,
      description: newActivity.description || undefined,
      createdAt: new Date(),
      ...(activityType === "event"
        ? {
            startDateTime: new Date(`${newActivity.startDate?.toISOString().split("T")[0]}T${newActivity.startTime}`),
            endDateTime: newActivity.endTime
              ? new Date(`${newActivity.startDate?.toISOString().split("T")[0]}T${newActivity.endTime}`)
              : undefined,
          }
        : {
            dueDate: newActivity.dueDate,
            status: newActivity.status,
          }),
    }

    setActivities([activity, ...activities])
    setIsNewActivitySheetOpen(false)
    toast({
      title: activityType === "event" ? "事件已新增" : "工作已新增",
      description: `已新增${activityType === "event" ? "事件" : "工作"}：${newActivity.subject}`,
    })
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
            {/* 頭像 + 機會名稱 + LINE 狀態 + 階段 */}
            <div className="flex gap-3">
              {/* Avatar with LINE status */}
              <div className="shrink-0">
                <Avatar className="h-14 w-14">
                  {account?.lineStatus === "joined" && account?.avatarUrl && (
                    <AvatarImage src={account.avatarUrl} alt={account.cxpName} />
                  )}
                  <AvatarFallback
                    className={
                      account?.lineStatus === "joined" ? "bg-blue-100 text-blue-700 font-semibold" : "bg-gray-100 text-gray-400"
                    }
                  >
                    {account?.lineStatus === "joined" ? getInitials(opportunity.accountName) : <UserX className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-xl truncate">{opportunity.name}</h2>
                    <div
                      className="flex items-center gap-1.5 mt-0.5 text-sm text-primary cursor-pointer hover:underline"
                      onClick={navigateToAccount}
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">帳戶：{opportunity.accountName}</span>
                    </div>
                    {/* LINE status */}
                    <div className="flex items-center gap-1.5 mt-0.5 text-sm">
                      <MessageCircle
                        className={`h-4 w-4 shrink-0 ${account?.lineStatus === "joined" ? "text-green-600" : "text-muted-foreground"}`}
                      />
                      <span className={account?.lineStatus === "joined" ? "text-foreground" : "text-muted-foreground"}>
                        {account?.lineStatus === "joined" ? account.lineName : "未加入 LINE"}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 ${stageColors[opportunity.stage]}`}>
                    {stageLabels[opportunity.stage]}
                  </Badge>
                </div>
              </div>
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent border-green-600 text-green-600 hover:bg-green-50"
                onClick={handleInvite}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                邀請
              </Button>
            </div>

            {/* 帳戶聯絡資訊 */}
            {account && (
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">帳戶聯絡資訊</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-primary border-primary hover:bg-primary/10 h-7 px-3"
                    onClick={navigateToAccount}
                  >
                    查看帳戶詳情
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{account.phone ? `886 ${account.phone}` : "未設定"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="break-all">{account.email || "未設定"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 機會狀態 */}
            <div className="space-y-3 pt-3 border-t">
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

        {/* 試駕同意書卡片 */}
        <TestDriveConsentCard
          consent={testDriveConsent}
          onCreateConsent={() => {
            // 建立試駕同意書後設定為 pending 狀態
            setTestDriveConsent({
              id: `tdc-${Date.now()}`,
              leadId: opportunity.id,
              status: "pending",
              generatedAt: new Date(),
              vehicleBrand: testDriveBrand || "Land Rover",
              vehicleModel: testDriveModel || opportunity.interestedModel || "Defender 90",
              testDriveDate: testDriveDate ? new Date(testDriveDate) : new Date(),
              testDriveTime: testDriveTime || "14:00",
            })
          }}
          onModifyInvite={() => {
            // 開啟修改試駕邀請的對話框（可以擴展）
          }}
          onViewLicense={(index) => {
            // 檢視駕照資料（可以擴展）
          }}
        />

        {/* 活動記錄卡片 */}
        <ActivityRecord activities={activities} onAddActivity={() => setIsNewActivitySheetOpen(true)} />
      </div>

      {/* New Activity Sheet */}
      <Sheet open={isNewActivitySheetOpen} onOpenChange={setIsNewActivitySheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl px-4 h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>新增活動</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 pb-8">
            {/* Activity Type Selection */}
            <div className="space-y-3">
              <Label>活動類型</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    activityType === "event"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  }`}
                  onClick={() => setActivityType("event")}
                >
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <span className="font-medium">事件</span>
                  <p className="text-xs text-muted-foreground mt-1">會議、拜訪、電話等</p>
                </button>
                <button
                  type="button"
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    activityType === "task"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  }`}
                  onClick={() => setActivityType("task")}
                >
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <span className="font-medium">工作</span>
                  <p className="text-xs text-muted-foreground mt-1">待辦事項、跟進任務</p>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label>
                主題 <span className="text-destructive">*</span>
              </Label>
              <Input
                value={newActivity.subject}
                onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
                placeholder={activityType === "event" ? "例如：客戶拜訪" : "例如：準備報價單"}
              />
            </div>

            <div className="space-y-2">
              <Label>說明</Label>
              <Textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="輸入詳細說明..."
                className="min-h-[80px]"
              />
            </div>

            {/* Event-specific fields */}
            {activityType === "event" && (
              <>
                <div className="space-y-2">
                  <Label>
                    日期 <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    date={newActivity.startDate}
                    onDateChange={(date) => setNewActivity({ ...newActivity, startDate: date })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>
                      開始時間 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={newActivity.startTime}
                      onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>結束時間</Label>
                    <Input
                      type="time"
                      value={newActivity.endTime}
                      onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Task-specific fields */}
            {activityType === "task" && (
              <>
                <div className="space-y-2">
                  <Label>
                    截止日期 <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    date={newActivity.dueDate}
                    onDateChange={(date) => setNewActivity({ ...newActivity, dueDate: date })}
                  />
                </div>
                <div className="space-y-3">
                  <Label>狀態</Label>
                  <RadioGroup
                    value={newActivity.status}
                    onValueChange={(value) =>
                      setNewActivity({
                        ...newActivity,
                        status: value as "not-started" | "in-progress" | "completed",
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-started" id="opp-not-started" />
                      <Label htmlFor="opp-not-started" className="font-normal">
                        未開始
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-progress" id="opp-in-progress" />
                      <Label htmlFor="opp-in-progress" className="font-normal">
                        進行中
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completed" id="opp-completed" />
                      <Label htmlFor="opp-completed" className="font-normal">
                        已完成
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSaveActivity}>
              {activityType === "event" ? "新增事件" : "新增工作"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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

      {/* Invite Sheet */}
      <Sheet open={isInviteSheetOpen} onOpenChange={setIsInviteSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl px-4 h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>
              {account?.lineStatus === "joined" ? `${opportunity.accountName} - 試駕邀請` : `邀請 ${opportunity.accountName} 加入 LINE`}
            </SheetTitle>
          </SheetHeader>
          
          {account?.lineStatus === "not-joined" ? (
            <Tabs defaultValue="test-drive" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="test-drive">試駕邀請</TabsTrigger>
                <TabsTrigger value="direct">加入官方帳號邀請</TabsTrigger>
              </TabsList>

              {/* Test Drive Invite Tab */}
              <TabsContent value="test-drive" className="space-y-4">
                {testDriveStep === "form" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>試駕日期</Label>
                      <Input type="date" value={testDriveDate} onChange={(e) => setTestDriveDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>試駕時間</Label>
                      <Input type="time" value={testDriveTime} onChange={(e) => setTestDriveTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>試駕車輛品牌</Label>
                      <Select value={testDriveBrand} onValueChange={(value) => { setTestDriveBrand(value); setTestDriveModel("") }}>
                        <SelectTrigger><SelectValue placeholder="選擇品牌" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jaguar">Jaguar</SelectItem>
                          <SelectItem value="Land Rover">Land Rover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>試駕車輛型號</Label>
                      <Select value={testDriveModel} onValueChange={setTestDriveModel} disabled={!testDriveBrand}>
                        <SelectTrigger><SelectValue placeholder={testDriveBrand ? "選擇型號" : "請先選擇品牌"} /></SelectTrigger>
                        <SelectContent>
                          {testDriveBrand && brandModels[testDriveBrand]?.map((model) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>駕照正面</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        {licenseFrontPreview ? (
                          <div className="relative">
                            <img src={licenseFrontPreview} alt="駕照正面" className="max-h-32 mx-auto rounded" />
                            <Button variant="ghost" size="sm" className="mt-2 bg-transparent" onClick={() => setLicenseFrontPreview(null)}>移除</Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">點擊上傳駕照正面</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLicenseFrontChange} />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>駕照背面</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        {licenseBackPreview ? (
                          <div className="relative">
                            <img src={licenseBackPreview} alt="駕照背面" className="max-h-32 mx-auto rounded" />
                            <Button variant="ghost" size="sm" className="mt-2 bg-transparent" onClick={() => setLicenseBackPreview(null)}>移除</Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">點擊上傳駕照背面</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleLicenseBackChange} />
                          </label>
                        )}
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleCreateTestDriveQR} disabled={!testDriveDate || !testDriveTime || !testDriveBrand || !testDriveModel}>
                      <Car className="h-4 w-4 mr-2" />
                      建立邀請 QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium">客戶邀請 QR Code</p>
                      <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                        <Image src="/qr-code.png" alt="試駕邀請 QR Code" width={240} height={240} className="object-contain w-full h-full" />
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
                        <span className="text-sm font-medium">{opportunity.accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">試駕車款</span>
                        <span className="text-sm font-medium">{testDriveBrand} {testDriveModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">試駕時間</span>
                        <span className="text-sm font-medium">{formatTestDriveDateTime()}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleEditTestDrive}>修改邀請資料</Button>
                  </div>
                )}
              </TabsContent>

              {/* Direct Invite Tab */}
              <TabsContent value="direct" className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">掃描 QR Code 加入</p>
                  <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                    <Image src="/qr-code.png" alt="邀請 QR Code" width={240} height={240} className="object-contain w-full h-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">編輯邀請訊息</p>
                  <Textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} className="min-h-[100px] text-sm" placeholder="輸入邀請訊息..." />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">邀請連結</p>
                    <Input value={inviteUrl} readOnly className="text-sm bg-muted text-muted-foreground cursor-not-allowed" />
                  </div>
                  <Button className="w-full" onClick={handleCopyMessage}>
                    {copied ? (<><Check className="h-4 w-4 mr-2 text-green-600" />已複製到剪貼簿</>) : (<><Copy className="h-4 w-4 mr-2" />複製邀請訊息</>)}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Joined users - only show test drive invite */
            <div className="space-y-4">
              {testDriveStep === "form" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>試駕日期</Label>
                    <Input type="date" value={testDriveDate} onChange={(e) => setTestDriveDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>試駕時間</Label>
                    <Input type="time" value={testDriveTime} onChange={(e) => setTestDriveTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>試駕車輛品牌</Label>
                    <Select value={testDriveBrand} onValueChange={(value) => { setTestDriveBrand(value); setTestDriveModel("") }}>
                      <SelectTrigger><SelectValue placeholder="選擇品牌" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jaguar">Jaguar</SelectItem>
                        <SelectItem value="Land Rover">Land Rover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>試駕車輛型號</Label>
                    <Select value={testDriveModel} onValueChange={setTestDriveModel} disabled={!testDriveBrand}>
                      <SelectTrigger><SelectValue placeholder={testDriveBrand ? "選擇型號" : "請先選擇品牌"} /></SelectTrigger>
                      <SelectContent>
                        {testDriveBrand && brandModels[testDriveBrand]?.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full mt-4" onClick={handleCreateTestDriveQR} disabled={!testDriveDate || !testDriveTime || !testDriveBrand || !testDriveModel}>
                    <Car className="h-4 w-4 mr-2" />
                    建立試駕邀請 QR Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">試駕邀請 QR Code</p>
                    <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                      <Image src="/qr-code.png" alt="試駕邀請 QR Code" width={240} height={240} className="object-contain w-full h-full" />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
                      <span className="text-sm font-medium">{opportunity.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">試駕車款</span>
                      <span className="text-sm font-medium">{testDriveBrand} {testDriveModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">試駕時間</span>
                      <span className="text-sm font-medium">{formatTestDriveDateTime()}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" onClick={handleEditTestDrive}>修改邀請資料</Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
