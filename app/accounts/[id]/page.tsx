"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  MessageCircle,
  UserX,
  PhoneCall,
  MailIcon,
  Copy,
  Check,
  X,
  Upload,
  Plus,
  ClipboardList,
  CheckCircle2,
  Users,
  Building2,
  AlertCircle,
  FileText,
  Heart,
} from "lucide-react"
import Image from "next/image"
import type { Account, Activity } from "@/types"
import { getAccountById, getOpportunitiesByAccountId } from "@/lib/mock-data"
import { ActivityRecord } from "@/components/activity-record"
import { OwnerTransferDialog } from "@/components/owner-transfer-dialog"

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const accountId = params.id as string

  const [account, setAccount] = useState<Account | null>(null)
  const [originalAccount, setOriginalAccount] = useState<Account | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [notes, setNotes] = useState("")
  const [originalNotes, setOriginalNotes] = useState("")
  const [hasNotesChanged, setHasNotesChanged] = useState(false)
  const [isOwnerTransferOpen, setIsOwnerTransferOpen] = useState(false)

  // Invite sheet states
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const inviteUrl = `https://example.com/invite/${accountId}`
  const defaultInviteMessage = `歡迎點擊以下連結，加入 Jaguar Land Rover 的官方帳號，獲得專屬活動資訊、並享受完整的體驗與支援服務。`
  const [inviteMessage, setInviteMessage] = useState(defaultInviteMessage)

  // Test drive invite states
  const [testDriveStep, setTestDriveStep] = useState<"form" | "qrcode">("form")
  const [testDriveDate, setTestDriveDate] = useState("")
  const [testDriveTime, setTestDriveTime] = useState("")
  const [testDriveBrand, setTestDriveBrand] = useState("")
  const [testDriveModel, setTestDriveModel] = useState("")
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<string | null>(null)
  const [licenseBackPreview, setLicenseBackPreview] = useState<string | null>(null)

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

  const brandModels: Record<string, string[]> = {
    Jaguar: ["F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XF", "XE"],
    "Land Rover": [
      "Defender 90",
      "Defender 110",
      "Defender 130",
      "Range Rover",
      "Range Rover Sport",
      "Range Rover Velar",
      "Discovery",
      "Discovery Sport",
    ],
  }

  useEffect(() => {
    const foundAccount = getAccountById(accountId)
    if (foundAccount) {
      setAccount(foundAccount)
      setOriginalAccount({ ...foundAccount })
      setActivities(foundAccount.activities || [])
      setNotes(foundAccount.notes || "")
      setOriginalNotes(foundAccount.notes || "")
    }
  }, [accountId])

  useEffect(() => {
    setHasNotesChanged(notes !== originalNotes)
  }, [notes, originalNotes])

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

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>載入中...</p>
      </div>
    )
  }

  const opportunities = getOpportunitiesByAccountId(accountId)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split("")
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setOriginalAccount({ ...account })
    setIsEditing(false)
    toast({
      title: "資料已更新",
      description: "帳戶資料已成功儲存",
    })
  }

  const handleSaveNotes = () => {
    setOriginalNotes(notes)
    setHasNotesChanged(false)
    toast({
      title: "描述已儲存",
      description: "您的描述已成功更新",
    })
  }

  const maritalStatusLabels: Record<string, string> = {
    single: "單身",
    married: "已婚",
    divorced: "離婚",
    widowed: "喪偶",
  }

  const handleCancel = () => {
    if (originalAccount) {
      setAccount({ ...originalAccount })
    }
    setIsEditing(false)
  }

  const handleCall = () => {
    if (account.phone) {
      window.location.href = `tel:+886${account.phone}`
    }
  }

  const handleEmail = () => {
    if (account.email) {
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
      hour12: false,
    })
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
    } as Activity

    setActivities([activity, ...activities])
    setIsNewActivitySheetOpen(false)
    toast({
      title: activityType === "event" ? "事件已新增" : "工作已新增",
      description: `已新增${activityType === "event" ? "事件" : "工作"}：${newActivity.subject}`,
    })
  }

  const genderLabels: Record<string, string> = {
    male: "男",
    female: "女",
    unknown: "未指定",
  }

  const leadSourceLabels: Record<string, string> = {
    "walk-in": "來店客",
    referral: "轉介紹",
    "retailer-experience": "經銷商體驗",
    "existing-customer": "既有客戶",
    "phone-in": "電話詢問",
    "line-booking": "LINE 預約",
    "field-visit": "外訪",
  }

  const maintenanceStatusLabels: Record<string, string> = {
    purchased: "已購",
    interested: "有興趣",
    none: "無",
  }

  const stageLabels: Record<string, string> = {
    "qualify": "Qualify",
    "test-drive-demo": "Test Drive Demo",
    "select-vehicle": "Select Vehicle",
    "appraise": "Appraise",
    "negotiate": "Negotiate",
    "take-order": "Take Order",
    "won": "Won",
    "lost": "Lost",
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">帳戶詳情</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit} className="bg-transparent">
              <Edit className="h-4 w-4 mr-1" />
              編輯
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-4 pb-36">
        {/* 基本資訊卡片 */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* 頭像 + 帳戶名稱 + LINE 狀態 */}
            <div className="flex gap-3">
              <div className="shrink-0">
                <Avatar className="h-14 w-14">
                  {account.lineStatus === "joined" && account.avatarUrl && (
                    <AvatarImage src={account.avatarUrl} alt={account.cxpName} />
                  )}
                  <AvatarFallback
                    className={
                      account.lineStatus === "joined"
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "bg-gray-100 text-gray-400"
                    }
                  >
                    {account.lineStatus === "joined" ? getInitials(account.cxpName) : <UserX className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-xl">{account.cxpName}</h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm">
                  <MessageCircle
                    className={`h-4 w-4 shrink-0 ${account.lineStatus === "joined" ? "text-green-600" : "text-muted-foreground"}`}
                  />
                  <span className={account.lineStatus === "joined" ? "text-foreground" : "text-muted-foreground"}>
                    {account.lineStatus === "joined" ? account.lineName : "未加入 LINE"}
                  </span>
                </div>
                {account.maintenanceStatus && (
                  <Badge variant="secondary" className="mt-1">
                    {maintenanceStatusLabels[account.maintenanceStatus] || account.maintenanceStatus}
                  </Badge>
                )}
              </div>
            </div>

            {/* 快速操作按鈕 */}
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

            {/* 聯絡資訊 */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{account.phone ? `886 ${account.phone}` : "未設定"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="break-all">{account.email || "未設定"}</span>
              </div>
              {account.email2 && (
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="break-all">{account.email2}</span>
                </div>
              )}
            </div>

            {/* 基本資料 */}
            <div className="space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">生日</span>
                  <p className="font-medium">{account.birthday ? formatDate(account.birthday) : "未設定"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">性別</span>
                  <p className="font-medium">{account.gender ? genderLabels[account.gender] : "未設定"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">身分證字號</span>
                  <p className="font-medium">{account.nationalId || "未設定"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">商機來源</span>
                  <p className="font-medium">
                    {account.leadSource ? leadSourceLabels[account.leadSource] : "未設定"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 關聯機會卡片 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              關聯機會 ({opportunities.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => router.push(`/opportunity-create?accountId=${account.id}`)}
            >
              <Plus className="h-4 w-4 mr-1" />
              新增
            </Button>
          </div>
          {opportunities.length > 0 ? (
            <div className="space-y-2">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => router.push(`/opportunities/${opp.id}`)}
                >
                  <div>
                    <p className="font-medium text-sm">{opp.name}</p>
                    <p className="text-xs text-muted-foreground">{opp.interestedModel}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stageLabels[opp.stage] || opp.stage}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">目前沒有關聯機會</p>
          )}
        </Card>

        {/* 車輛偏好卡片 */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Car className="h-5 w-5" />
            車輛偏好
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">品牌偏好</span>
              <p className="font-medium">
                {account.brandPreferences?.length ? account.brandPreferences.join(", ") : "未設定"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">興趣車款</span>
              <p className="font-medium">{account.interestedModel || "未設定"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">SV/V8 偏好</span>
              <p className="font-medium">{account.performancePreference ? "是" : "否"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">車輛數</span>
              <p className="font-medium">{account.vehicleCount ?? "未設定"}</p>
            </div>
          </div>
        </Card>

        {/* 其他資訊卡片（合併地址、婚姻家庭、興趣等） */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            其他資訊
          </h3>
          
          {/* 婚姻家庭 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Heart className="h-4 w-4" />
              婚姻家庭
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">婚姻狀態</span>
                <p className="font-medium">{account.maritalStatus ? maritalStatusLabels[account.maritalStatus] : "未設定"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">家庭成員數</span>
                <p className="font-medium">{account.familyMemberCount ?? "未設定"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">有子女</span>
                <p className="font-medium">{account.hasChildren === undefined ? "未設定" : account.hasChildren ? "是" : "否"}</p>
              </div>
              {account.hasChildren && account.childrenCount && (
                <div>
                  <span className="text-muted-foreground">子女數</span>
                  <p className="font-medium">{account.childrenCount}</p>
                </div>
              )}
            </div>
          </div>

          {/* 職業與興趣 */}
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">職業</span>
                <p className="font-medium">{account.occupation || "未設定"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">行業</span>
                <p className="font-medium">{account.industry || "未設定"}</p>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">興趣</span>
              <p className="font-medium">{account.interests?.length ? account.interests.join("、") : "未設定"}</p>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">聯絡偏好</span>
              <p className="font-medium">
                {account.contactPreferences?.length
                  ? account.contactPreferences
                      .map((p) => (p === "phone" ? "電話" : p === "email" ? "郵件" : p === "sms" ? "簡訊" : "��寄"))
                      .join(", ")
                  : "未設定"}
              </p>
            </div>
          </div>

          {/* 地址資訊 */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              地址資訊
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">帳單地址</span>
                <p className="font-medium">
                  {account.billingCity || account.billingAddress
                    ? `${account.billingCity || ""} ${account.billingAddress || ""}`
                    : "未設定"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">郵寄地址</span>
                <p className="font-medium">
                  {account.shippingCity || account.shippingAddress
                    ? `${account.shippingCity || ""} ${account.shippingAddress || ""}`
                    : "未設定"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 描述卡片 */}
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

        {/* 活動記錄卡片 */}
        <ActivityRecord activities={activities} onAddActivity={() => setIsNewActivitySheetOpen(true)} />
      </main>

      {/* New Activity Sheet */}
      <Sheet open={isNewActivitySheetOpen} onOpenChange={setIsNewActivitySheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl px-4 h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>新增活動</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 pb-8">
            <div className="space-y-3">
              <Label>活動類型</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    activityType === "event" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
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
                    activityType === "task" ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
                  }`}
                  onClick={() => setActivityType("task")}
                >
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <span className="font-medium">工作</span>
                  <p className="text-xs text-muted-foreground mt-1">待辦事項、跟進任務</p>
                </button>
              </div>
            </div>

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
                      <RadioGroupItem value="not-started" id="acc-not-started" />
                      <Label htmlFor="acc-not-started" className="font-normal">
                        未開始
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-progress" id="acc-in-progress" />
                      <Label htmlFor="acc-in-progress" className="font-normal">
                        進行中
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completed" id="acc-completed" />
                      <Label htmlFor="acc-completed" className="font-normal">
                        已完成
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSaveActivity}>
              {activityType === "event" ? "���增事件" : "新增工作"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Invite Sheet */}
      <Sheet open={isInviteSheetOpen} onOpenChange={setIsInviteSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl px-4 h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>
              {account.lineStatus === "joined" ? `${account.cxpName} - 試駕邀請` : `邀請 ${account.cxpName} 加入 LINE`}
            </SheetTitle>
          </SheetHeader>

          {account.lineStatus === "not-joined" ? (
            <Tabs defaultValue="test-drive" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="test-drive">試駕邀請</TabsTrigger>
                <TabsTrigger value="direct">加入官方帳號邀請</TabsTrigger>
              </TabsList>

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
                      <Select
                        value={testDriveBrand}
                        onValueChange={(value) => {
                          setTestDriveBrand(value)
                          setTestDriveModel("")
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇品牌" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Jaguar">Jaguar</SelectItem>
                          <SelectItem value="Land Rover">Land Rover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>試駕車輛型號</Label>
                      <Select value={testDriveModel} onValueChange={setTestDriveModel} disabled={!testDriveBrand}>
                        <SelectTrigger>
                          <SelectValue placeholder={testDriveBrand ? "選擇型號" : "請先選擇品牌"} />
                        </SelectTrigger>
                        <SelectContent>
                          {testDriveBrand &&
                            brandModels[testDriveBrand]?.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 bg-transparent"
                              onClick={() => setLicenseFrontPreview(null)}
                            >
                              移除
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">點擊上傳駕照正面</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLicenseFrontChange}
                            />
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 bg-transparent"
                              onClick={() => setLicenseBackPreview(null)}
                            >
                              移除
                            </Button>
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
                    <Button
                      className="w-full mt-4"
                      onClick={handleCreateTestDriveQR}
                      disabled={!testDriveDate || !testDriveTime || !testDriveBrand || !testDriveModel}
                    >
                      <Car className="h-4 w-4 mr-2" />
                      建立邀請 QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium">客戶邀請 QR Code</p>
                      <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                        <Image
                          src="/qr-code.png"
                          alt="試駕邀請 QR Code"
                          width={240}
                          height={240}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
                        <span className="text-sm font-medium">{account.cxpName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">試駕車款</span>
                        <span className="text-sm font-medium">
                          {testDriveBrand} {testDriveModel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">試駕時間</span>
                        <span className="text-sm font-medium">{formatTestDriveDateTime()}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleEditTestDrive}>
                      修改邀請資料
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="direct" className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">掃描 QR Code 加入</p>
                  <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                    <Image
                      src="/qr-code.png"
                      alt="邀請 QR Code"
                      width={240}
                      height={240}
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">編輯邀請訊息</p>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="min-h-[100px] text-sm"
                    placeholder="輸入邀請訊息..."
                  />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">邀請連結</p>
                    <Input
                      value={inviteUrl}
                      readOnly
                      className="text-sm bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <Button className="w-full" onClick={handleCopyMessage}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        已複製到剪貼簿
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        複製邀請訊息
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
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
                    <Select
                      value={testDriveBrand}
                      onValueChange={(value) => {
                        setTestDriveBrand(value)
                        setTestDriveModel("")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇品牌" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jaguar">Jaguar</SelectItem>
                        <SelectItem value="Land Rover">Land Rover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>試駕車輛型號</Label>
                    <Select value={testDriveModel} onValueChange={setTestDriveModel} disabled={!testDriveBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder={testDriveBrand ? "選擇型號" : "請先選擇品牌"} />
                      </SelectTrigger>
                      <SelectContent>
                        {testDriveBrand &&
                          brandModels[testDriveBrand]?.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={handleCreateTestDriveQR}
                    disabled={!testDriveDate || !testDriveTime || !testDriveBrand || !testDriveModel}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    建立試駕邀請 QR Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">試駕邀請 QR Code</p>
                    <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                      <Image
                        src="/qr-code.png"
                        alt="試駕邀請 QR Code"
                        width={240}
                        height={240}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
                      <span className="text-sm font-medium">{account.cxpName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">試駕車款</span>
                      <span className="text-sm font-medium">
                        {testDriveBrand} {testDriveModel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">試駕時間</span>
                      <span className="text-sm font-medium">{formatTestDriveDateTime()}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" onClick={handleEditTestDrive}>
                    修改邀請資料
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
          <div className="px-4 py-2 border-b border-border">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setIsOwnerTransferOpen(true)}>
              擁有者變更
            </Button>
          </div>
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

      <OwnerTransferDialog
        open={isOwnerTransferOpen}
        onOpenChange={setIsOwnerTransferOpen}
        entityType="account"
        entityName={account?.cxpName || ""}
        currentOwner="目前使用者"
        onTransfer={(newOwnerId, newOwnerName) => {
          toast({
            title: "擁有者已變更",
            description: `此帳戶已轉移給 ${newOwnerName}`,
          })
          router.push("/accounts")
        }}
      />
    </div>
  )
}
