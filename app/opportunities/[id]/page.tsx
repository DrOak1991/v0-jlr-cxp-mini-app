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
import { detailCategoryLabels } from "@/lib/field-definitions"

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
  X,
  Upload,
  Plus,
  ClipboardList,
  ChevronLeft,
  ChevronDown,
  Search,
  User,
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
import { getOpportunityById, getActivitiesByOpportunityId, getAccountById, searchAccounts } from "@/lib/mock-data"
import { ActivityRecord } from "@/components/activity-record"
import { TestDriveConsentCard } from "@/components/test-drive-consent-card"

const stageLabels: Record<string, string> = {
  "contact": "聯繫",
  "test-drive": "試駕",
  "vehicle-selection": "車型選擇",
  "trade-in": "舊車處理",
  "negotiation": "談判",
  "order": "訂購",
  "delivery": "交車",
  "lost": "Lost",
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
  const [notes, setNotes] = useState(opportunityData?.notes || "")
  const [originalNotes, setOriginalNotes] = useState(opportunityData?.notes || "")
  const [hasNotesChanged, setHasNotesChanged] = useState(false)

  // Lost dialog
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false)
  const [isExistingCarSheetOpen, setIsExistingCarSheetOpen] = useState(false)
  const [isCompetitorCarSheetOpen, setIsCompetitorCarSheetOpen] = useState(false)
  const [isReferrerSheetOpen, setIsReferrerSheetOpen] = useState(false)
  const [referrerSearch, setReferrerSearch] = useState("")
  const [referrer, setReferrer] = useState("")
  const [carBrandSearch, setCarBrandSearch] = useState("")
  const [carModelSearch, setCarModelSearch] = useState("")
  const [competitorBrandSearch, setCompetitorBrandSearch] = useState("")
  const [competitorModelSearch, setCompetitorModelSearch] = useState("")

  // 現有車品牌選項
  const existingCarBrandOptions: Record<string, string[]> = {
    "BMW": ["X1", "X3", "X5", "X7", "3 Series", "5 Series", "7 Series"],
    "Mercedes-Benz": ["GLA", "GLC", "GLE", "GLS", "C-Class", "E-Class", "S-Class"],
    "Audi": ["Q3", "Q5", "Q7", "Q8", "A4", "A6", "A8"],
    "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60"],
    "Porsche": ["Cayenne", "Macan", "Taycan", "911", "Panamera"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
    "Toyota": ["RAV4", "Camry", "Corolla Cross", "Land Cruiser"],
    "Lexus": ["RX", "NX", "UX", "ES", "LS", "LX"],
  }

  // 篩選品牌列表
  const filteredBrands = Object.keys(existingCarBrandOptions).filter(brand =>
    brand.toLowerCase().includes(carBrandSearch.toLowerCase())
  )

  // 篩選車款列表
  const availableModels = opportunity.existingCarBrand ? existingCarBrandOptions[opportunity.existingCarBrand] || [] : []
  const filteredModels = availableModels.filter(model =>
    model.toLowerCase().includes(carModelSearch.toLowerCase())
  )

  const handleSelectBrand = (brand: string) => {
    setOpportunity({ ...opportunity, existingCarBrand: brand, existingCarModel: "" })
    setCarBrandSearch("")
    setCarModelSearch("")
  }

  const handleSelectModel = (model: string) => {
    setOpportunity({ ...opportunity, existingCarModel: model })
    setIsExistingCarSheetOpen(false)
    setCarBrandSearch("")
    setCarModelSearch("")
  }

  // 競牌車輛篩選
  const filteredCompetitorBrands = Object.keys(existingCarBrandOptions).filter(brand =>
    brand.toLowerCase().includes(competitorBrandSearch.toLowerCase())
  )
  const availableCompetitorModels = competitorBrand ? existingCarBrandOptions[competitorBrand] || [] : []
  const filteredCompetitorModels = availableCompetitorModels.filter(model =>
    model.toLowerCase().includes(competitorModelSearch.toLowerCase())
  )

  const handleSelectCompetitorBrand = (brand: string) => {
    setCompetitorBrand(brand)
    setCompetitorModel("")
    setCompetitorBrandSearch("")
    setCompetitorModelSearch("")
  }

  const handleSelectCompetitorModel = (model: string) => {
    setCompetitorModel(model)
    setIsCompetitorCarSheetOpen(false)
    setCompetitorBrandSearch("")
    setCompetitorModelSearch("")
  }

  // 流失原因表單狀態
  const [lostCategory, setLostCategory] = useState("") // 經銷商所失客戶類別
  const [lostReason, setLostReason] = useState("") // 經銷商所失原因
  const [lostNotes, setLostNotes] = useState("") // 經銷商所失客戶注意事項
  const [boughtCompetitor, setBoughtCompetitor] = useState("") // 是否購買競牌車輛
  const [competitorBrand, setCompetitorBrand] = useState("") // 購買的品牌
  const [competitorModel, setCompetitorModel] = useState("") // 購買的車款
  const [newTargetDate, setNewTargetDate] = useState<Date | undefined>(undefined) // 新目標日期

  // Loss reason options (shared between Retailer and JLR)
  const lossReasonOptions = [
    { value: "", label: "--None--" },
    { value: "brand-image", label: "Brand Image" },
    { value: "co2-emissions", label: "CO2 Emissions (Taxation)" },
    { value: "design", label: "Design" },
    { value: "fuel-efficiency", label: "Fuel Efficiency" },
    { value: "lead-time", label: "Lead Time / Delivery Delay" },
    { value: "performance", label: "Performance" },
    { value: "power-output", label: "Power Output (Taxation)" },
    { value: "price", label: "Price (MSRP)" },
    { value: "range", label: "Range (for EV Vehicles)" },
    { value: "tco", label: "Total Cost of Ownership (TCO)" },
  ]

  // Invite sheet states
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const inviteUrl = `https://example.com/invite/${account?.id}`
  const defaultInviteMessage = `歡迎點擊以下連結，加入 Jaguar Land Rover 的官方帳號，獲得專屬活動資訊、並享受完整的體驗與支援服務。`
  const [inviteMessage, setInviteMessage] = useState(defaultInviteMessage)
  
  // Activity sheet states
  const [isNewActivitySheetOpen, setIsNewActivitySheetOpen] = useState(false)
  const [activityType, setActivityType] = useState<"event" | "task">("event")
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    subject: "",
    description: "",
    startDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    dueDate: undefined as Date | undefined,
    status: "not-started" as "not-started" | "in-progress" | "completed",
  })

  // 主題建議選項
  const eventSubjectSuggestions = [
    "邀約至展示中心賞車",
    "客戶拜訪",
    "討論報價",
    "車輛抵購估價",
  ]
  const taskSubjectSuggestions = [
    "電話聯繫",
    "提供報價",
    "發送簡訊或電子郵件",
  ]

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
    setHasNotesChanged(notes !== originalNotes)
  }, [notes, originalNotes])

  const handleSaveNotes = () => {
    setOriginalNotes(notes)
    setHasNotesChanged(false)
    toast({
      title: "描述已儲存",
      description: "您的描述內容已成功更新",
    })
  }

  useEffect(() => {
    const newOpportunityData = getOpportunityById(params.id as string)
    const newActivitiesData = getActivitiesByOpportunityId(params.id as string)
    const newAccountData = newOpportunityData ? getAccountById(newOpportunityData.accountId) : undefined

    if (newOpportunityData) {
      setOpportunity(newOpportunityData)
      setOriginalOpportunity(newOpportunityData)
      
      // 解析已存在的流失原因資料
      if (newOpportunityData.lostReason) {
        try {
          const lossInfo = JSON.parse(newOpportunityData.lostReason)
          if (lossInfo.lostCategory) setLostCategory(lossInfo.lostCategory)
          if (lossInfo.lostReason) setLostReason(lossInfo.lostReason)
          if (lossInfo.lostNotes) setLostNotes(lossInfo.lostNotes)
          if (lossInfo.boughtCompetitor) setBoughtCompetitor(lossInfo.boughtCompetitor)
          if (lossInfo.competitorBrand) setCompetitorBrand(lossInfo.competitorBrand)
          if (lossInfo.competitorModel) setCompetitorModel(lossInfo.competitorModel)
        } catch {
          // 如果不是 JSON 格式，忽略
        }
      }
    }
    setActivities(newActivitiesData)
    setAccount(newAccountData)
  }, [params.id])

  useEffect(() => {
    const changed = JSON.stringify(opportunity) !== JSON.stringify(originalOpportunity)
    setHasFieldsChanged(changed)
  }, [opportunity, originalOpportunity])

  const handleSave = () => {
    // Check if stage changed to lost
    if (opportunity.stage === "lost" && originalOpportunity.stage !== "lost") {
      setIsLostDialogOpen(true)
      return
    }

    performSave()
  }

  const performSave = () => {
    // 如果在編輯流失原因，需要保存
    if (opportunity.stage === "lost" && (lostCategory || lostReason)) {
      const lossInfo = {
        lostCategory,
        lostReason: lostReason,
        lostNotes: lostNotes.trim(),
        boughtCompetitor,
        competitorBrand,
        competitorModel,
      }
      const updatedOpportunity = {
        ...opportunity,
        lostReason: JSON.stringify(lossInfo),
      }
      setOpportunity(updatedOpportunity)
      setOriginalOpportunity({ ...updatedOpportunity })
    } else {
      setOriginalOpportunity({ ...opportunity })
    }
    
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "資料已更新",
      description: "機會資訊已成功儲存",
    })
  }

  const handleLostSave = () => {
    // 驗證必填欄位
    if (!lostCategory || !lostReason || !boughtCompetitor) {
      toast({
        title: "請填寫必填欄位",
        description: "經銷商所失客戶類別、經銷商所失原因、是否購買競牌車輛為必填",
        variant: "destructive",
      })
      return
    }

    // 根據「是否購買競牌車輛」的選擇，驗證條件必填欄位
    if (boughtCompetitor === "yes") {
      // 選「是的」：購買的品牌、購買的車款必填
      if (!competitorBrand.trim() || !competitorModel.trim()) {
        toast({
          title: "請填寫購買資訊",
          description: "已選擇購買競牌車輛，請填寫購買的品牌和車款",
          variant: "destructive",
        })
        return
      }
    } else {
      // 選「否」或「不清楚」：新目標日期必填
      if (!newTargetDate) {
        toast({
          title: "請填寫新目標日期",
          description: "請選擇新目標日期",
          variant: "destructive",
        })
        return
      }
    }

    // 組合流失原因資訊
    const lossInfo = {
      lostCategory,
      lostReason,
      lostNotes: lostNotes.trim(),
      boughtCompetitor,
      competitorBrand: competitorBrand.trim(),
      competitorModel: competitorModel.trim(),
      newTargetDate: newTargetDate?.toISOString(),
    }

    const updatedOpportunity = { 
      ...opportunity, 
      lostReason: JSON.stringify(lossInfo), 
      probability: 0 
    }
    setOpportunity(updatedOpportunity)
    setOriginalOpportunity({ ...updatedOpportunity })
    setIsLostDialogOpen(false)
    // Reset form
    setLostCategory("")
    setLostReason("")
    setLostNotes("")
    setBoughtCompetitor("")
    setCompetitorBrand("")
    setCompetitorModel("")
    setNewTargetDate(undefined)
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
        title: "請選擇新目標日期",
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
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <X className="h-5 w-5" />
          ) : (
            <Edit className="h-5 w-5" />
          )}
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">


        {/* 基本資訊卡片 */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* 頭像 + 機會名稱 + LINE 狀態 + 階段 - 檢視模式才顯示 */}
            {!isEditing && (
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
                  </div>
                </div>
              </div>
            )}

            {/* 快速操作按鈕 - 編輯模式下隱藏 */}
            {!isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCall}>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  撥打
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleEmail}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  簡訊
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
            )}

            {/* 關聯帳戶與聯絡資訊 - 編輯模式下隱藏 */}
            {!isEditing && account && (
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={navigateToAccount}
                  >
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">帳戶：</span>
                    <span className="text-sm font-medium text-primary">{opportunity.accountName}</span>
                  </div>
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
              {/* 機會名稱 - 僅編輯模式顯示 */}
              {isEditing && (
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">機會名稱</Label>
                  <Input
                    value={opportunity.name || ""}
                    onChange={(e) => setOpportunity({ ...opportunity, name: e.target.value })}
                    placeholder="請輸入機會名稱"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">機會階段</span>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Select
                        value={opportunity.stage}
                        onValueChange={(value) => setOpportunity({ ...opportunity, stage: value as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選擇階段" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contact">聯繫</SelectItem>
                          <SelectItem value="test-drive">試駕</SelectItem>
                          <SelectItem value="vehicle-selection">車型選擇</SelectItem>
                          <SelectItem value="trade-in">舊車處理</SelectItem>
                          <SelectItem value="negotiation">談判</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        目前在 CXP Mini App 之中，只支援更新到談判階段，後續銷售階段請回到 CXP 桌面版進行。
                      </p>
                    </div>
                  ) : (
                    <p className="text-foreground font-medium">{stageLabels[opportunity.stage]}</p>
                  )}
                </div>
              </div>

              {/* 訂購日期 */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">訂購日期</span>
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

        {/* 流失原因區塊 - 檢視模式 */}
        {!isEditing && opportunity.stage === "lost" && (
          <Card className="p-4">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              流失原因
            </h3>
            {(() => {
              try {
                const lossInfo = opportunity.lostReason ? JSON.parse(opportunity.lostReason) : null
                if (lossInfo && lossInfo.lostCategory) {
                  // 新格式：lostCategory, lostReason, lostNotes, boughtCompetitor, competitorBrand, competitorModel
                  const categoryLabel = lossInfo.lostCategory === "product" ? "產品" : lossInfo.lostCategory === "service" ? "服務" : lossInfo.lostCategory
                  const reasonLabel = lossInfo.lostReason === "design" ? "設計" : lossInfo.lostReason === "price" ? "價格" : lossInfo.lostReason
                  const boughtLabel = lossInfo.boughtCompetitor === "yes" ? "是" : lossInfo.boughtCompetitor === "no" ? "否" : lossInfo.boughtCompetitor === "unknown" ? "不確定" : lossInfo.boughtCompetitor

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">經銷商所失客戶類別</Label>
                          <p className="text-sm font-medium mt-1">{categoryLabel}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">經銷商所失原因</Label>
                          <p className="text-sm font-medium mt-1">{reasonLabel}</p>
                        </div>
                      </div>
                      
                      {lossInfo.lostNotes && (
                        <div>
                          <Label className="text-sm text-muted-foreground">經銷商所失客戶注意事項</Label>
                          <p className="text-sm font-medium mt-1">{lossInfo.lostNotes}</p>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">是否購買競牌車輛</Label>
                            <p className="text-sm font-medium mt-1">{boughtLabel}</p>
                          </div>
                          {lossInfo.boughtCompetitor === "yes" && lossInfo.competitorBrand && (
                            <div>
                              <Label className="text-sm text-muted-foreground">購買車輛</Label>
                              <p className="text-sm font-medium mt-1">
                                {lossInfo.competitorBrand}{lossInfo.competitorModel ? ` ${lossInfo.competitorModel}` : ""}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }
                return <p className="text-sm text-muted-foreground">{opportunity.lostReason || "未記錄流失原因"}</p>
              } catch {
                return <p className="text-sm text-muted-foreground">{opportunity.lostReason || "未記錄流失原因"}</p>
              }
            })()}
          </Card>
        )}

        {/* 描述區塊 */}
        <Card className="p-4">
          <Label className="text-base font-semibold mb-2 block">描述</Label>

          {hasNotesChanged && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">有未儲存的變更</span>
            </div>
          )}

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="新增描述..."
            className="min-h-[120px] mb-3"
          />

          <Button onClick={handleSaveNotes} disabled={!hasNotesChanged} className="w-full" size="sm">
            儲存描述
          </Button>
        </Card>

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

          {/* 次要形式 */}
          <div>
            <Label className="text-sm text-muted-foreground">次要形式</Label>
            {isEditing ? (
              <Select
                value={opportunity.detailCategory || ""}
                onValueChange={(value) => setOpportunity({ ...opportunity, detailCategory: value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">零售</SelectItem>
                  <SelectItem value="lease">租賃</SelectItem>
                  <SelectItem value="approved-pre-owned">APO 認證中古車</SelectItem>
                  <SelectItem value="accessories">原廠精品</SelectItem>
                  <SelectItem value="sv-custom">SV 訂製車</SelectItem>
                  <SelectItem value="genuine-accessories">原廠配件</SelectItem>
                  <SelectItem value="self-registration">自領牌</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.detailCategory ? detailCategoryLabels[opportunity.detailCategory] || opportunity.detailCategory : "未設定"}
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
                  <SelectItem value="mild-hybrid">高效輕油電</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.powerType === "gasoline" ? "汽油"
                  : opportunity.powerType === "diesel" ? "柴油"
                  : opportunity.powerType === "electric" ? "純電"
                  : opportunity.powerType === "hybrid" ? "混合動力"
                  : opportunity.powerType === "mild-hybrid" ? "高效輕油電"
                  : "未設定"}
              </p>
            )}
          </div>

          {/* SV/V8 偏好 */}
          <div>
            <Label className="text-sm text-muted-foreground">顧客想購買 SV / OCTA / V8 車款</Label>
            {isEditing ? (
              <div className="mt-1">
                <Switch
                  checked={opportunity.performancePreference || false}
                  onCheckedChange={(checked) => setOpportunity({ ...opportunity, performancePreference: checked })}
                />
              </div>
            ) : (
              <p className="text-foreground mt-1">{opportunity.performancePreference ? "是" : "否"}</p>
            )}
          </div>

          {/* Vista 訂單號碼 */}
          <div>
            <Label className="text-sm text-muted-foreground">Vista 訂單號碼</Label>
            {isEditing ? (
              <Input
                value={opportunity.vistaOrderNumber || ""}
                onChange={(e) => setOpportunity({ ...opportunity, vistaOrderNumber: e.target.value })}
                placeholder="請輸入 Vista 訂單號碼"
                className="mt-1"
              />
            ) : (
              <p className="text-foreground mt-1">{opportunity.vistaOrderNumber || "未設定"}</p>
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
                  <SelectItem value="retailer-experience">經銷商外展 / 體驗活動 (Retailer Experience)</SelectItem>
                  <SelectItem value="existing-customer">既有客戶 (Existing Customer)</SelectItem>
                  <SelectItem value="phone-in">來電客 (Phone-in)</SelectItem>
                  <SelectItem value="line-booking">網路客預約 (LINE)</SelectItem>
                  <SelectItem value="field-visit">陌生開發 (Field Visit)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {opportunity.leadSource === "walk-in" ? "來店客 (Walk-in)"
                  : opportunity.leadSource === "referral" ? "轉介 (Referral)"
                  : opportunity.leadSource === "retailer-experience" ? "經銷商外展 / 體驗活動 (Retailer Experience)"
                  : opportunity.leadSource === "existing-customer" ? "既有客戶 (Existing Customer)"
                  : opportunity.leadSource === "phone-in" ? "來電客 (Phone-in)"
                  : opportunity.leadSource === "line-booking" ? "網路客預約 (LINE)"
                  : opportunity.leadSource === "field-visit" ? "陌生開發 (Field Visit)"
                  : "未設定"}
              </p>
            )}
            {/* 轉介者欄位 - 當選擇 referral 時顯示 */}
            {opportunity.leadSource === "referral" && (
              isEditing ? (
                <div className="mt-2">
                  <Label className="text-sm text-muted-foreground">轉介者</Label>
                  <button
                    type="button"
                    onClick={() => setIsReferrerSheetOpen(true)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground text-left hover:bg-accent transition-colors flex items-center justify-between"
                  >
                    <span className={referrer ? "text-foreground" : "text-muted-foreground"}>
                      {referrer || "點擊搜尋轉介者"}
                    </span>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : referrer && (
                <p className="text-sm text-muted-foreground mt-1">轉介者：{referrer}</p>
              )
            )}
          </div>

          {/* 現有車輛品牌 - 編輯模式下使用灰色匡包裝 */}
          {isEditing && (
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">現有車輛品牌</Label>
                <button
                  onClick={() => setIsExistingCarSheetOpen(true)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground text-left hover:bg-accent transition-colors"
                >
                  {opportunity.existingCarBrand || "點擊選擇品牌"}
                </button>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">現有車輛</Label>
                <button
                  onClick={() => opportunity.existingCarBrand && setIsExistingCarSheetOpen(true)}
                  disabled={!opportunity.existingCarBrand}
                  className={`w-full mt-1 px-3 py-2 border rounded-md text-left transition-colors ${
                    opportunity.existingCarBrand
                      ? "border-input bg-background text-foreground hover:bg-accent"
                      : "border-input bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {opportunity.existingCarModel || (opportunity.existingCarBrand ? "點擊選擇車款" : "請先選擇品牌")}
                </button>
              </div>
            </div>
          )}

          {/* 檢視模式 */}
          {!isEditing && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground">現有車輛品牌</Label>
                <p className="text-foreground mt-1">{opportunity.existingCarBrand || "未設定"}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">現有車輛</Label>
                <p className="text-foreground mt-1">{opportunity.existingCarModel || "未設定"}</p>
              </div>
            </>
          )}
        </Card>

        {/* 流失原因編輯區塊 - 僅在編輯模式且 stage 為 lost 時顯示 */}
        {isEditing && opportunity.stage === "lost" && (
          <Card className="p-4">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              流失原因
            </h3>
            <div className="space-y-4">
              {/* 經銷商所失客戶類別 */}
              <div className="space-y-2">
                <Label>經銷商所失客戶類別</Label>
                <Select value={lostCategory} onValueChange={setLostCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">產品</SelectItem>
                    <SelectItem value="service">服務</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 經銷商所失原因 */}
              <div className="space-y-2">
                <Label>經銷商所失原因</Label>
                <Select value={lostReason} onValueChange={setLostReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">設計</SelectItem>
                    <SelectItem value="price">價格</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 經銷商所失客戶注意事項 */}
              <div className="space-y-2">
                <Label>經銷商所失客戶注意事項</Label>
                <Textarea
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="請輸入注意事項..."
                  className="min-h-[80px]"
                />
              </div>

              {/* 分隔線與競牌車輛區塊 */}
              <div className="border-t pt-4 space-y-4">
                {/* 是否購買競牌車輛 */}
                <div className="space-y-2">
                  <Label>是否��買競牌車輛？</Label>
                  <Select value={boughtCompetitor} onValueChange={setBoughtCompetitor}>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">是</SelectItem>
                      <SelectItem value="no">否</SelectItem>
                      <SelectItem value="unknown">不確定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 購買的品牌與車款 - 使用灰色匡包裝 */}
                {boughtCompetitor === "yes" && (
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-sm">購買的品牌</Label>
                      <button
                        onClick={() => setIsCompetitorCarSheetOpen(true)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground text-left hover:bg-accent transition-colors"
                      >
                        {competitorBrand || "點擊選擇品牌"}
                      </button>
                    </div>

                    <div>
                      <Label className="text-sm">購買的車款</Label>
                      <button
                        onClick={() => competitorBrand && setIsCompetitorCarSheetOpen(true)}
                        disabled={!competitorBrand}
                        className={`w-full mt-1 px-3 py-2 border rounded-md text-left transition-colors ${
                          competitorBrand
                            ? "border-input bg-background text-foreground hover:bg-accent"
                            : "border-input bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {competitorModel || (competitorBrand ? "點擊選擇車款" : "請先選擇品牌")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* 試駕同意書卡片 - 編輯模式下隱藏 */}
        {!isEditing && (
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
        )}

        {/* 活動記錄卡片 - 編輯模式下隱藏 */}
        {!isEditing && (
          <ActivityRecord activities={activities} onAddActivity={() => setIsNewActivitySheetOpen(true)} />
        )}
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
                </button>
              </div>
              {/* Activity Type Description */}
              <div className="bg-muted/50 rounded-lg p-3">
                {activityType === "event" ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    任何需要與公司主管報備的行程，例如：客戶拜訪、邀約至展示中心賞車...等等，請將行程建立成事件。<br />
                    若是試駕，請從「建立試駕同意書」單元新增。
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    一般行程、雜事，例如電話聯繫跟進、活動邀約、生日祝福...等等，請將行程建立成工作。
                  </p>
                )}
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label>
                主題 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="relative">
                  <Input
                    value={newActivity.subject}
                    onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
                    placeholder={activityType === "event" ? "例如：客戶拜訪" : "例如：電話聯繫"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isSubjectDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {isSubjectDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {(activityType === "event" ? eventSubjectSuggestions : taskSubjectSuggestions).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                        onClick={() => {
                          setNewActivity({ ...newActivity, subject: suggestion })
                          setIsSubjectDropdownOpen(false)
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

      {/* 轉介者搜尋 Sheet */}
      <Sheet open={isReferrerSheetOpen} onOpenChange={setIsReferrerSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>搜尋轉介者</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <Input
              placeholder="輸入姓名或電話搜尋..."
              value={referrerSearch}
              onChange={(e) => setReferrerSearch(e.target.value)}
              autoFocus
            />

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pb-4">
              {searchAccounts(referrerSearch).map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setReferrer(account.cxpName)
                    setIsReferrerSheetOpen(false)
                    setReferrerSearch("")
                  }}
                  className="w-full p-3 border border-input rounded-lg hover:bg-accent hover:border-primary transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{account.cxpName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{account.phone || account.mobilePhone || "無電話"}</span>
                    </div>
                  </div>
                </button>
              ))}
              {searchAccounts(referrerSearch).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">找不到符合的帳戶</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Existing Car Selection Sheet */}
      <Sheet open={isExistingCarSheetOpen} onOpenChange={setIsExistingCarSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>
              {!opportunity.existingCarBrand ? "選擇現有車輛品牌" : "選擇現有車輛"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            {/* 品牌選擇 */}
            {!opportunity.existingCarBrand ? (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="搜尋品牌..."
                    value={carBrandSearch}
                    onChange={(e) => setCarBrandSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-4">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleSelectBrand(brand)}
                        className="p-3 border border-input rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <p className="font-medium text-sm">{brand}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">找不到符合的品牌</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 返回品牌選擇按鈕 */}
                <button
                  onClick={() => {
                    setOpportunity({ ...opportunity, existingCarBrand: "" })
                    setCarBrandSearch("")
                    setCarModelSearch("")
                  }}
                  className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  返回選擇品牌
                </button>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{opportunity.existingCarBrand}</span>
                    <span className="text-xs text-muted-foreground">已選擇</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="搜尋車款..."
                    value={carModelSearch}
                    onChange={(e) => setCarModelSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-4">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleSelectModel(model)}
                        className="p-3 border border-input rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <p className="font-medium text-sm">{model}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">找不到符合的車款</p>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Lost Dialog */}
      <Dialog open={isLostDialogOpen} onOpenChange={setIsLostDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>機會流失原因</DialogTitle>
            <DialogDescription>請填寫此機會流失的詳細資訊</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 經銷商所失客戶類別 */}
            <div className="space-y-2">
              <Label>經銷商所失客戶類別 <span className="text-destructive">*</span></Label>
              <Select value={lostCategory} onValueChange={setLostCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">產品</SelectItem>
                  <SelectItem value="service">服務</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 經銷商所失原因 */}
            <div className="space-y-2">
              <Label>經銷商所失原因 <span className="text-destructive">*</span></Label>
              <Select value={lostReason} onValueChange={setLostReason}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">設計</SelectItem>
                  <SelectItem value="price">價格</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 經銷商所失客戶注意事項 */}
            <div className="space-y-2">
              <Label>經銷商所失客戶注意事項</Label>
              <Textarea
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                placeholder="請輸入注意事項..."
                className="min-h-[80px]"
              />
            </div>

            {/* 分隔線與競牌車輛區塊 */}
            <div className="border-t pt-4 space-y-4">
              {/* 是否購買競牌車輛 */}
              <div className="space-y-2">
                <Label>是否購買競牌車輛？ <span className="text-destructive">*</span></Label>
                <Select value={boughtCompetitor} onValueChange={setBoughtCompetitor}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">是的</SelectItem>
                    <SelectItem value="no">否</SelectItem>
                    <SelectItem value="unknown">不清楚</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 未選擇時的提示 */}
              {!boughtCompetitor && (
                <div className="rounded-lg p-3 text-sm bg-muted border border-border">
                  <p className="text-muted-foreground">請先選擇「是否購買競牌車輛」，以顯示後續填寫欄位</p>
                </div>
              )}

              {/* 選擇後顯示的欄位區塊 */}
              {boughtCompetitor && (
                <>
                  {/* 根據選擇顯示不同的必填提示 */}
                  <div className={`rounded-lg p-3 text-sm ${boughtCompetitor === "yes" ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"}`}>
                    {boughtCompetitor === "yes" ? (
                      <p className="text-amber-700">客戶已購買競牌車輛，請填寫「購買的品牌」和「購買的車款」</p>
                    ) : (
                      <p className="text-blue-700">請填寫「新目標日期」以便後續追蹤</p>
                    )}
                  </div>

                  {/* 購買的品牌與車款 - 使用灰色匡包裝 */}
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div>
                      <Label className="text-sm">
                        購買的品牌
                        {boughtCompetitor === "yes" && <span className="text-destructive"> *</span>}
                      </Label>
                      <button
                        onClick={() => setIsCompetitorCarSheetOpen(true)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground text-left hover:bg-accent transition-colors"
                      >
                        {competitorBrand || "點擊選擇品牌"}
                      </button>
                    </div>

                    <div>
                      <Label className="text-sm">
                        購買的車款
                        {boughtCompetitor === "yes" && <span className="text-destructive"> *</span>}
                      </Label>
                      <button
                        onClick={() => competitorBrand && setIsCompetitorCarSheetOpen(true)}
                        disabled={!competitorBrand}
                        className={`w-full mt-1 px-3 py-2 border rounded-md text-left transition-colors ${
                          competitorBrand
                            ? "border-input bg-background text-foreground hover:bg-accent"
                            : "border-input bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {competitorModel || (competitorBrand ? "點擊選擇車款" : "請先選擇品牌")}
                      </button>
                    </div>
                  </div>

                  {/* 新目標日期 */}
                  <div className="space-y-2">
                    <Label>
                      新目標日期
                      {boughtCompetitor !== "yes" && <span className="text-destructive"> *</span>}
                    </Label>
                    <DatePicker
                      date={newTargetDate}
                      onDateChange={setNewTargetDate}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsLostDialogOpen(false)} className="bg-transparent">
              取消
            </Button>
            <Button onClick={handleLostSave}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Competitor Car Selection Sheet */}
      <Sheet open={isCompetitorCarSheetOpen} onOpenChange={setIsCompetitorCarSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>
              {!competitorBrand ? "選擇購買的品牌" : "選擇購買的車款"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            {/* 品牌選擇 */}
            {!competitorBrand ? (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="搜尋品牌..."
                    value={competitorBrandSearch}
                    onChange={(e) => setCompetitorBrandSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-4">
                  {filteredCompetitorBrands.length > 0 ? (
                    filteredCompetitorBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleSelectCompetitorBrand(brand)}
                        className="p-3 border border-input rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <p className="font-medium text-sm">{brand}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">找不到符合的品牌</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 返回品牌選擇按鈕 */}
                <button
                  onClick={() => {
                    setCompetitorBrand("")
                    setCompetitorBrandSearch("")
                    setCompetitorModelSearch("")
                  }}
                  className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  返回選擇品牌
                </button>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{competitorBrand}</span>
                    <span className="text-xs text-muted-foreground">已選擇</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="搜尋車款..."
                    value={competitorModelSearch}
                    onChange={(e) => setCompetitorModelSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pb-4">
                  {filteredCompetitorModels.length > 0 ? (
                    filteredCompetitorModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleSelectCompetitorModel(model)}
                        className="p-3 border border-input rounded-lg hover:bg-accent hover:border-primary transition-colors text-left"
                      >
                        <p className="font-medium text-sm">{model}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">找不到符合的車款</p>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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

      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
          {hasFieldsChanged && (
            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">您有未儲存的變更</span>
              </div>
            </div>
          )}
          <div className="p-4 flex gap-3">
            <Button variant="outline" size="lg" className="flex-1 bg-transparent" onClick={handleCancel}>
              <X className="h-5 w-5 mr-2" />
              取消
            </Button>
            <Button size="lg" className="flex-1" onClick={handleSave}>
              <Check className="h-5 w-5 mr-2" />
              儲存
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
