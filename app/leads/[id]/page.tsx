"use client"

// Lead detail page - using shared ActivityRecord and TestDriveConsentCard components
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Edit,
  PhoneCall,
  MailIcon,
  AlertCircle,
  Plus,
  X,
  Check,
  CreditCard,
  FileText,
  QrCode,
  Mic,
  Sparkles,
  Loader2,
  Upload,
  Car,
  Eye,
  CheckCircle2,
  ClipboardList,
} from "lucide-react"
import type { Lead, Activity, TaskActivity, TaskStatus, TestDriveConsent } from "@/types"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { DatePicker, DateTimePicker } from "@/components/date-picker"
import { getLeadById, getActivitiesByLeadId } from "@/lib/mock-data"
import { MultiSelect } from "@/components/multi-select"
import { ActivityRecord } from "@/components/activity-record"
import { TestDriveConsentCard } from "@/components/test-drive-consent-card"
import { LeadConversionDialog } from "@/components/lead-conversion-dialog"

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const leadData = getLeadById(params.id as string)
  const activitiesData = getActivitiesByLeadId(params.id as string)

  const [isEditing, setIsEditing] = useState(false)
  const [lead, setLead] = useState<Lead>(leadData || ({} as Lead))
  const [originalLead, setOriginalLead] = useState<Lead>(leadData || ({} as Lead))
  const [activities, setActivities] = useState<Activity[]>(activitiesData)
  const [testDriveConsent, setTestDriveConsent] = useState<TestDriveConsent | null>(leadData?.testDriveConsent || null)

  const [notes, setNotes] = useState(leadData?.notes || "")
  const [originalNotes, setOriginalNotes] = useState(leadData?.notes || "")
  const [hasNotesChanged, setHasNotesChanged] = useState(false)
  const [hasFieldsChanged, setHasFieldsChanged] = useState(false)

  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false)
  const [activityType, setActivityType] = useState<"event" | "task">("event")
  const [newActivity, setNewActivity] = useState({
    subject: "",
    description: "",
    startDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    dueDate: undefined as Date | undefined,
    status: "not-started" as TaskStatus,
  })

  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false)
  const [lostCategory, setLostCategory] = useState("")
  const [lostReason, setLostReason] = useState("")
  const [isConvertedDialogOpen, setIsConvertedDialogOpen] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  // Call record modal states
  const [isCallRecordOpen, setIsCallRecordOpen] = useState(false)
  const [callRecordText, setCallRecordText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [hasRecordedText, setHasRecordedText] = useState(false)

  // Mock data for demo
  const mockVoiceText = "嗯...今天跟王先生聊了一下，他說他對 Defender 90 蠻有興趣的，想要下週六來店裡試駕看看，然後他太太也會一起來，可能要準備兩杯咖啡。對了他有問到分期的利率大概多少，我說回頭查一下再跟他說。"
  const mockAiProcessedText = `通話摘要：
- 客戶對 Defender 90 有興趣
- 預約下週六到店試駕，夫妻同行
- 客戶詢問分期利率，待回覆
- 備註：準備兩杯咖啡接待`

  // Test drive consent modal states
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(false)
  const [testDriveFormStep, setTestDriveFormStep] = useState<"form" | "qrcode">("form")
  const [testDriveDate, setTestDriveDate] = useState("")
  const [testDriveTime, setTestDriveTime] = useState("")
  const [testDriveBrand, setTestDriveBrand] = useState("")
  const [testDriveModel, setTestDriveModel] = useState("")
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<string | null>(null)
  const [licenseBackPreview, setLicenseBackPreview] = useState<string | null>(null)

  // License lightbox states
  const [isLicenseLightboxOpen, setIsLicenseLightboxOpen] = useState(false)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  // Model options based on brand
  const brandModels: Record<string, string[]> = {
    "Jaguar": ["F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XF", "XE"],
    "Land Rover": ["Defender 90", "Defender 110", "Defender 130", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Discovery", "Discovery Sport"]
  }

  useEffect(() => {
    const newLeadData = getLeadById(params.id as string)
    const newActivitiesData = getActivitiesByLeadId(params.id as string)

    if (newLeadData) {
      setLead(newLeadData)
      setOriginalLead(newLeadData)
      setNotes(newLeadData.notes || "")
      setOriginalNotes(newLeadData.notes || "")
      setTestDriveConsent(newLeadData.testDriveConsent || null)
    }

    setActivities(newActivitiesData)
  }, [params.id])

  const handleCancel = () => {
    setLead({ ...originalLead })
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "編輯已取消",
      description: "您的變更已取消",
    })
  }

  useEffect(() => { }, [params.id, router])

  useEffect(() => {
    setHasNotesChanged(notes !== originalNotes)
  }, [notes, originalNotes])

  useEffect(() => {
    if (isEditing) {
      setHasFieldsChanged(JSON.stringify(lead) !== JSON.stringify(originalLead))
    }
  }, [lead, originalLead, isEditing])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasNotesChanged || (isEditing && hasFieldsChanged)) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasNotesChanged, isEditing, hasFieldsChanged])

  // Reset new activity form when sheet opens
  useEffect(() => {
    if (isNewActivityOpen) {
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
  }, [isNewActivityOpen])

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

    // Create new activity
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
    setIsNewActivityOpen(false)
    toast({
      title: activityType === "event" ? "事件已新增" : "工作已新增",
      description: `已新增${activityType === "event" ? "事件" : "工作"}：${newActivity.subject}`,
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

  const handleEdit = () => {
    setOriginalLead({ ...lead })
    setIsEditing(true)
  }

  const handleSave = () => {
    const stageChanged = lead.stage !== originalLead.stage

    if (stageChanged && lead.stage === "lost") {
      setPendingSave(true)
      setIsLostDialogOpen(true)
      return
    }

    if (stageChanged && lead.stage === "converted") {
      setPendingSave(true)
      setIsConvertedDialogOpen(true)
      return
    }

    performSave()
  }

  const performSave = () => {
    console.log("[v0] Save lead:", lead)
    setOriginalLead({ ...lead })
    setIsEditing(false)
    setHasFieldsChanged(false)
    setPendingSave(false)
    toast({
      title: "資料已更新",
      description: "客戶資訊已成功儲存",
    })
  }

  const handleLostSave = () => {
    if (!lostReason.trim()) {
      toast({
        title: "請輸入原因",
        description: "請說明商機流失的原因",
        variant: "destructive",
      })
      return
    }

    // 將流失原因存到 lead 物件
    const updatedLead = { 
      ...lead, 
      lostCategory: lostCategory as Lead["lostCategory"],
      lostReason: lostReason.trim() 
    }
    setLead(updatedLead)
    setOriginalLead({ ...updatedLead })
    setIsLostDialogOpen(false)
    setLostCategory("")
    setLostReason("")
    setIsEditing(false)
    setHasFieldsChanged(false)
    setPendingSave(false)
    toast({
      title: "資料已更新",
      description: "商機已標記為流失",
    })
  }

  const handleLostCancel = () => {
    setLead({ ...lead, stage: originalLead.stage })
    setIsLostDialogOpen(false)
    setLostCategory("")
    setLostReason("")
    setPendingSave(false)

    const leadWithoutStageChange = { ...lead, stage: originalLead.stage }
    console.log("[v0] Save lead without stage change:", leadWithoutStageChange)
    setOriginalLead({ ...leadWithoutStageChange })
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "資料已更新",
      description: "客戶資訊已成功儲存（商機狀態未變更）",
    })
  }

  const handleConversion = (data: {
    accountMode: "new" | "existing"
    accountId?: string
    newAccountFirstName?: string
    newAccountLastName?: string
    updateLeadSource: boolean
    opportunityMode: "new" | "existing"
    opportunityId?: string
    newOpportunityName?: string
  }) => {
    console.log("[v0] Convert lead with data:", data)
    
    // Update lead stage to converted
    const updatedLead = { ...lead, stage: "converted" as const }
    setLead(updatedLead)
    setOriginalLead({ ...updatedLead })
    setIsConvertedDialogOpen(false)
    setIsEditing(false)
    setHasFieldsChanged(false)
    setPendingSave(false)
    
    toast({
      title: "商機已轉換",
      description: "正在導向機會頁面...",
    })

    // Navigate to opportunity page
    // In real implementation, this would be the newly created/selected opportunity ID
    const opportunityId = data.opportunityMode === "existing" ? data.opportunityId : "new-opp-1"
    setTimeout(() => {
      router.push(`/opportunities/${opportunityId}`)
    }, 500)
  }

  const handleConvertedCancel = () => {
    setLead({ ...lead, stage: originalLead.stage })
    setIsConvertedDialogOpen(false)
    setPendingSave(false)

    const leadWithoutStageChange = { ...lead, stage: originalLead.stage }
    console.log("[v0] Save lead without stage change:", leadWithoutStageChange)
    setOriginalLead({ ...leadWithoutStageChange })
    setIsEditing(false)
    setHasFieldsChanged(false)
    toast({
      title: "資料已更新",
      description: "客戶資訊已成功儲存（商機狀態未變更）",
    })
  }

  const handleBack = () => {
    if (hasNotesChanged || (isEditing && hasFieldsChanged)) {
      if (confirm("您有未儲存的變更，確定要離開嗎？")) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const handleCall = () => {
    // For prototype: directly show modal without actually calling
    // In production: would use window.location.href = `tel:+886${lead.phone}`
    setIsCallRecordOpen(true)
    setCallRecordText("")
    setHasRecordedText(false)
  }

  const handleVoiceRecord = () => {
    setIsRecording(true)
    // Simulate recording delay then show mock text
    setTimeout(() => {
      setIsRecording(false)
      setCallRecordText(mockVoiceText)
      setHasRecordedText(true)
    }, 1500)
  }

  const handleAiProcess = () => {
    setIsAiProcessing(true)
    // Simulate AI processing delay
    setTimeout(() => {
      setIsAiProcessing(false)
      setCallRecordText(mockAiProcessedText)
    }, 2000)
  }

  const handleSaveCallRecord = () => {
    // Add to activities as a completed task
    const activity: TaskActivity = {
      id: Date.now().toString(),
      type: "task",
      subject: "通話紀錄",
      description: callRecordText,
      createdAt: new Date(),
      dueDate: new Date(),
      status: "completed",
    }
    setActivities([activity, ...activities])

    setIsCallRecordOpen(false)
    setCallRecordText("")
    setHasRecordedText(false)

    toast({
      title: "通話紀錄已儲存",
      description: "紀錄已新增至活動歷史",
    })
  }

  const handleSkipCallRecord = () => {
    setIsCallRecordOpen(false)
    setCallRecordText("")
    setHasRecordedText(false)
  }

  const handleEmail = () => {
    window.location.href = `mailto:${lead.email}`
  }

  const handleInvite = async () => {
    const inviteUrl = `https://example.com/invite/${lead.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "邀請加入 LINE",
          text: `邀請 ${lead.cxpName} 加入 LINE 好友`,
          url: inviteUrl,
        })
      } catch (err) {
        console.log("[v0] Share cancelled or failed:", err)
      }
    } else {
      navigator.clipboard.writeText(inviteUrl)
      alert("邀請連結已複製到剪貼簿")
    }
  }

  const handleCreateActivity = () => {
    if (!newTask.subject || !newTask.dueDate) {
      toast({
        title: "請填寫必填欄位",
        description: "主題和到期日期為必填",
        variant: "destructive",
      })
      return
    }

    const activity: TaskActivity = {
      id: Date.now().toString(),
      type: "task",
      subject: newTask.subject,
      description: newTask.description || undefined,
      createdAt: new Date(),
      dueDate: newTask.dueDate,
      status: newTask.status,
    }

    setActivities([activity, ...activities])
    setIsNewActivityOpen(false)
    setNewTask({
      subject: "",
      description: "",
      dueDate: undefined,
      status: "not-started",
    })

    toast({
      title: "工作已新增",
      description: "新工作已成功建立",
    })
  }

  const taskStatusLabels: Record<TaskStatus, string> = {
    "not-started": "沒有開始",
    "in-progress": "進行中",
    completed: "已完成",
    waiting: "等待別人",
    deferred: "延期",
  }

  const stageLabels = {
    new: "New",
    "follow-up": "Follow up",
    lost: "Lost",
    converted: "Converted",
  }

  const handleStartTestDrive = () => {
    setTestDriveFormStep("form")
    setTestDriveDate("")
    setTestDriveTime("")
    setTestDriveBrand("")
    setTestDriveModel("")
    setLicenseFrontPreview(null)
    setLicenseBackPreview(null)
    setIsTestDriveModalOpen(true)
  }

  const handleCreateTestDriveQR = () => {
    setTestDriveFormStep("qrcode")
  }

  const handleEditTestDriveForm = () => {
    setTestDriveFormStep("form")
  }

  const handleSaveTestDriveConsent = () => {
    const newConsent = {
      id: Date.now().toString(),
      leadId: lead.id,
      status: "pending" as const,
      generatedAt: new Date(),
      qrCodeUrl: "/qr-code.png",
      testDriveDate: new Date(testDriveDate),
      testDriveTime: testDriveTime,
      vehicleBrand: testDriveBrand,
      vehicleModel: testDriveModel,
      licensePhotoFront: licenseFrontPreview || "/generic-identification-card-front.png",
      licensePhotoBack: licenseBackPreview || "/driver-license-back.png",
    }
    setTestDriveConsent(newConsent)
    setIsTestDriveModalOpen(false)
    toast({
      title: "試駕同意書已建立",
      description: "QR Code 已生成，等待客戶確認",
    })
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

  const handleViewLicense = (index: number) => {
    setLightboxImageIndex(index)
    setIsLicenseLightboxOpen(true)
  }

  const formatTestDriveDateTime = (date?: Date, time?: string) => {
    if (!date || !time) return "未設定"
    const d = new Date(date)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${time}`
  }

  const handleModifyTestDriveInvite = () => {
    if (testDriveConsent) {
      setTestDriveDate(testDriveConsent.testDriveDate ? testDriveConsent.testDriveDate.toISOString().split("T")[0] : "")
      setTestDriveTime(testDriveConsent.testDriveTime || "")
      setTestDriveBrand(testDriveConsent.vehicleBrand || "")
      setTestDriveModel(testDriveConsent.vehicleModel || "")
      setLicenseFrontPreview(testDriveConsent.licensePhotoFront || null)
      setLicenseBackPreview(testDriveConsent.licensePhotoBack || null)
      setTestDriveFormStep("form")
      setIsTestDriveModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">商機詳情</h1>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-5 w-5" />
            </Button>
          )}
          {isEditing && <div className="w-10" />}
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h2 className="text-2xl font-bold mb-4">{lead.cxpName}</h2>

          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-2" />
              撥打
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
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

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">商機狀態</span>
                {isEditing ? (
                  <Select
                    value={lead.stage || "new"}
                    onValueChange={(value) => setLead({ ...lead, stage: value as any })}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="選擇商機狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="follow-up">Follow up</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-foreground">{lead.stage ? stageLabels[lead.stage] : "未設定"}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MessageCircle
                className={`h-4 w-4 ${lead.lineStatus === "joined" ? "text-green-600" : "text-muted-foreground"}`}
              />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">LINE</span>
                <p className="text-foreground">{lead.lineStatus === "joined" ? lead.lineName : "未加入"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">行動電話</span>
                {isEditing ? (
                  <div className="flex mt-1">
                    <div className="flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-sm text-muted-foreground select-none">
                      886
                    </div>
                    <Input
                      value={lead.phone.replace(/^0/, "").replace(/[-\s]/g, "")}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[-\s]/g, "")
                        const normalized = cleaned.startsWith("0") ? cleaned.substring(1) : cleaned
                        setLead({ ...lead, phone: normalized })
                      }}
                      placeholder="912345678"
                      className="rounded-l-none"
                    />
                  </div>
                ) : (
                  <p className="text-foreground">886 {lead.phone.replace(/^0/, "").replace(/[-\s]/g, "")}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">電子郵件</span>
                {isEditing ? (
                  <Input
                    type="email"
                    value={lead.email}
                    onChange={(e) => setLead({ ...lead, email: e.target.value })}
                    placeholder="輸入電子郵件"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-foreground break-all">{lead.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">建檔時間</span>
                <p className="text-foreground">{formatDate(lead.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 流失原因區塊 - 僅當 stage = lost 時顯示 */}
        {lead.stage === "lost" && (
          <Card className="p-4">
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              流失原因
            </h3>

            <div className="space-y-4">
              {/* 戰敗原因 */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">戰敗原因</Label>
                {isEditing ? (
                  <Select
                    value={lead.lostCategory || ""}
                    onValueChange={(value) => setLead({ ...lead, lostCategory: value as Lead["lostCategory"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇戰敗原因" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitor">購買競牌</SelectItem>
                      <SelectItem value="duplicate">重複資料</SelectItem>
                      <SelectItem value="no-interest">沒有意願購買</SelectItem>
                      <SelectItem value="unreachable">無法聯繫</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium">
                    {lead.lostCategory === "competitor" && "購買競牌"}
                    {lead.lostCategory === "duplicate" && "重複資料"}
                    {lead.lostCategory === "no-interest" && "沒有意願購買"}
                    {lead.lostCategory === "unreachable" && "無法聯繫"}
                    {!lead.lostCategory && <span className="text-muted-foreground">未選擇</span>}
                  </p>
                )}
              </div>

              {/* 詳細說明 */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">詳細說明</Label>
                {isEditing ? (
                  <Textarea
                    value={lead.lostReason || ""}
                    onChange={(e) => setLead({ ...lead, lostReason: e.target.value })}
                    placeholder="輸入流失原因的詳細說明..."
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {lead.lostReason || <span className="text-muted-foreground font-normal">未記錄詳細說明</span>}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

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

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">客戶資訊</h3>

          {/* 生日 */}
          <div>
            <Label className="text-sm text-muted-foreground">生日</Label>
            {isEditing ? (
              <input
                type="date"
                value={lead.birthday ? lead.birthday.toISOString().split("T")[0] : ""}
                onChange={(e) => setLead({ ...lead, birthday: new Date(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              />
            ) : (
              <p className="text-foreground mt-1">{lead.birthday ? formatDate(lead.birthday) : "未設定"}</p>
            )}
          </div>

          {/* 性別 */}
          <div>
            <Label className="text-sm text-muted-foreground">性別</Label>
            {isEditing ? (
              <Select value={lead.gender || ""} onValueChange={(value) => setLead({ ...lead, gender: value as any })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇性別" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="unknown">不清楚</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {lead.gender === "male" ? "男" : lead.gender === "female" ? "女" : lead.gender === "unknown" ? "不清楚" : "未設定"}
              </p>
            )}
          </div>

          {/* 身分證字號 */}
          <div>
            <Label className="text-sm text-muted-foreground">身分證字號</Label>
            {isEditing ? (
              <Input
                value={lead.idNumber || ""}
                onChange={(e) => setLead({ ...lead, idNumber: e.target.value })}
                placeholder="請輸入身分證字號"
                className="mt-1"
              />
            ) : (
              <p className="text-foreground mt-1">{lead.idNumber || "未設定"}</p>
            )}
          </div>

          {/* 地址 */}
          <div>
            <Label className="text-sm text-muted-foreground">地址</Label>
            {isEditing ? (
              <div className="bg-muted/50 border rounded-lg p-4 mt-1 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">縣市</Label>
                  <Select value={lead.city || ""} onValueChange={(value) => setLead({ ...lead, city: value })}>
                    <SelectTrigger><SelectValue placeholder="請選擇縣市" /></SelectTrigger>
                    <SelectContent>
                      {["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">地址</Label>
                  <Input
                    value={lead.address || ""}
                    onChange={(e) => setLead({ ...lead, address: e.target.value })}
                    placeholder="請輸入地址"
                  />
                </div>
              </div>
            ) : (
              <p className="text-foreground mt-1">
                {lead.city || lead.address ? `${lead.city || ""}${lead.address || ""}` : "未���定"}
              </p>
            )}
          </div>

          {/* 職業 */}
          <div>
            <Label className="text-sm text-muted-foreground">職業</Label>
            {isEditing ? (
              <Select value={lead.occupation || ""} onValueChange={(value) => setLead({ ...lead, occupation: value })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇職業" /></SelectTrigger>
                <SelectContent>
                  {["企業主", "高階主管", "中階主管", "專業人士", "自由業", "軍公教", "退休人員", "學生", "其他"].map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">{lead.occupation || "未設定"}</p>
            )}
          </div>

          {/* 行業 */}
          <div>
            <Label className="text-sm text-muted-foreground">行業</Label>
            {isEditing ? (
              <Select value={lead.industry || ""} onValueChange={(value) => setLead({ ...lead, industry: value })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇行業" /></SelectTrigger>
                <SelectContent>
                  {["科技業", "金融業", "製造業", "服務業", "醫療業", "營建業", "貿易業", "農林漁牧", "政府機關", "教育業", "其他"].map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">{lead.industry || "未設定"}</p>
            )}
          </div>

          {/* 工作狀態 */}
          <div>
            <Label className="text-sm text-muted-foreground">工作狀態</Label>
            {isEditing ? (
              <Select value={lead.workStatus || ""} onValueChange={(value) => setLead({ ...lead, workStatus: value })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇工作狀態" /></SelectTrigger>
                <SelectContent>
                  {["全職", "兼職", "自營", "��休", "待業", "學生"].map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">{lead.workStatus || "未設定"}</p>
            )}
          </div>

          {/* 購車方式 */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">購車方式</Label>
            {isEditing ? (
              <RadioGroup
                value={lead.carType || ""}
                onValueChange={(value) => setLead({ ...lead, carType: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new-car" id="new-car" />
                  <Label htmlFor="new-car" className="font-normal">新車</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="certified-used" id="certified-used" />
                  <Label htmlFor="certified-used" className="font-normal">認證中古車</Label>
                </div>
              </RadioGroup>
            ) : (
              <p className="text-foreground">
                {lead.carType === "new-car" ? "新車" : lead.carType === "certified-used" ? "認證中古車" : "未設定"}
              </p>
            )}
          </div>

          {/* 詳細分類 */}
          <div>
            <Label className="text-sm text-muted-foreground">詳細分類</Label>
            {isEditing ? (
              <Select value={lead.detailCategory || ""} onValueChange={(value) => setLead({ ...lead, detailCategory: value as any })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇詳細分類" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="fleet">Fleet</SelectItem>
                  <SelectItem value="approved-pre-owned">Approved Pre-Owned</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {lead.detailCategory === "retail" ? "Retail" : lead.detailCategory === "fleet" ? "Fleet" : lead.detailCategory === "approved-pre-owned" ? "Approved Pre-Owned" : "未設定"}
              </p>
            )}
          </div>

          {/* 主要興趣車款 */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">主要興趣車款</Label>
            {isEditing ? (
              <Select value={lead.interestedModel || ""} onValueChange={(value) => setLead({ ...lead, interestedModel: value as any })}>
                <SelectTrigger><SelectValue placeholder="請選擇車款" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="defender-90">Defender 90</SelectItem>
                  <SelectItem value="defender-110">Defender 110</SelectItem>
                  <SelectItem value="range-rover">Range Rover</SelectItem>
                  <SelectItem value="range-rover-sport">Range Rover Sport</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="i-pace">I-PACE</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground">
                {lead.interestedModel === "defender-90" ? "Defender 90"
                  : lead.interestedModel === "defender-110" ? "Defender 110"
                    : lead.interestedModel === "range-rover" ? "Range Rover"
                      : lead.interestedModel === "range-rover-sport" ? "Range Rover Sport"
                        : lead.interestedModel === "discovery" ? "Discovery"
                          : lead.interestedModel === "i-pace" ? "I-PACE"
                            : "未設定"}
              </p>
            )}
          </div>

          {/* 動力型式 */}
          <div>
            <Label className="text-sm text-muted-foreground">動力型式</Label>
            {isEditing ? (
              <Select value={lead.powerType || ""} onValueChange={(value) => setLead({ ...lead, powerType: value as any })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇動力型式" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">汽油</SelectItem>
                  <SelectItem value="diesel">柴油</SelectItem>
                  <SelectItem value="electric">純電</SelectItem>
                  <SelectItem value="hybrid">混合動力</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">
                {lead.powerType === "gasoline" ? "汽油" : lead.powerType === "diesel" ? "柴油" : lead.powerType === "electric" ? "純電" : lead.powerType === "hybrid" ? "混合動力" : "未設定"}
              </p>
            )}
          </div>

          {/* 顧客想購買 SV / V8 車款 */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">顧客想購買 SV / V8 車款</Label>
            {isEditing ? (
              <Switch
                checked={lead.performancePreference || false}
                onCheckedChange={(checked) => setLead({ ...lead, performancePreference: checked })}
              />
            ) : (
              <p className="text-foreground">{lead.performancePreference ? "是" : "否"}</p>
            )}
          </div>

          {/* 商機來源 */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">商機來源</Label>
            {isEditing ? (
              <div className="space-y-3">
                <Select value={lead.leadSource || ""} onValueChange={(value) => setLead({ ...lead, leadSource: value as any, referrer: value !== "referral" ? "" : lead.referrer })}>
                  <SelectTrigger><SelectValue placeholder="請選擇商機來源" /></SelectTrigger>
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
                {lead.leadSource === "referral" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">轉介者</Label>
                    <Input
                      value={lead.referrer || ""}
                      onChange={(e) => setLead({ ...lead, referrer: e.target.value })}
                      placeholder="請輸入轉介者姓名"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-foreground">
                  {lead.leadSource === "walk-in" ? "來店客 (Walk-in)"
                    : lead.leadSource === "referral" ? "轉介 (Referral)"
                      : lead.leadSource === "retailer-experience" ? "經銷商外展 / 體驗活動 (Retailer Experience)"
                        : lead.leadSource === "existing-customer" ? "���有客戶 (Existing Customer)"
                          : lead.leadSource === "phone-in" ? "來電客 (Phone-in)"
                            : lead.leadSource === "line-booking" ? "網路客預約 (LINE)"
                              : lead.leadSource === "field-visit" ? "陌生開發 (Field Visit)"
                                : "未設定"}
                </p>
                {lead.leadSource === "referral" && lead.referrer && (
                  <p className="text-sm text-muted-foreground mt-1">轉介者：{lead.referrer}</p>
                )}
              </div>
            )}
          </div>

          {/* 興趣 */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">興趣</Label>
            {isEditing ? (
              <MultiSelect
                options={["高爾夫", "旅遊", "攝影", "品酒", "科技", "戶外運動", "藝術", "音樂", "閱讀", "健身"]}
                selected={lead.interests || []}
                onChange={(selected) => setLead({ ...lead, interests: selected })}
                placeholder="請選擇興趣（可多選）"
              />
            ) : (
              <p className="text-foreground">
                {lead.interests && lead.interests.length > 0 ? lead.interests.join("、") : "未設定"}
              </p>
            )}
          </div>

          {/* 現有車輛品牌 */}
          <div>
            <Label className="text-sm text-muted-foreground">現有車輛品牌</Label>
            {isEditing ? (
              <Select value={lead.existingCarBrand || ""} onValueChange={(value) => setLead({ ...lead, existingCarBrand: value, existingCarModel: "" })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="請選擇品牌" /></SelectTrigger>
                <SelectContent>
                  {["BMW", "Mercedes-Benz", "Audi", "Volvo", "Porsche", "Tesla", "Toyota", "Lexus"].map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">{lead.existingCarBrand || "未設定"}</p>
            )}
          </div>

          {/* 現有車輛 */}
          <div>
            <Label className="text-sm text-muted-foreground">現有車輛</Label>
            {isEditing ? (
              <Select value={lead.existingCarModel || ""} onValueChange={(value) => setLead({ ...lead, existingCarModel: value })} disabled={!lead.existingCarBrand}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={lead.existingCarBrand ? "請選擇車款" : "請先選擇品牌"} /></SelectTrigger>
                <SelectContent>
                  {lead.existingCarBrand && ({
                    "BMW": ["X1", "X3", "X5", "X7", "3 Series", "5 Series", "7 Series"],
                    "Mercedes-Benz": ["GLA", "GLC", "GLE", "GLS", "C-Class", "E-Class", "S-Class"],
                    "Audi": ["Q3", "Q5", "Q7", "Q8", "A4", "A6", "A8"],
                    "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60"],
                    "Porsche": ["Cayenne", "Macan", "Taycan", "911", "Panamera"],
                    "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
                    "Toyota": ["RAV4", "Camry", "Corolla Cross", "Land Cruiser"],
                    "Lexus": ["RX", "NX", "UX", "ES", "LS", "LX"],
                  } as Record<string, string[]>)[lead.existingCarBrand]?.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground mt-1">{lead.existingCarModel || "未設定"}</p>
            )}
          </div>

          {/* 客戶願意接受 JLR 與經銷商聯絡的管道 */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">客戶願意接受 JLR 與經銷商聯絡的管道</Label>
            {isEditing ? (
              <div className="space-y-2">
                {[
                  { value: "mail", label: "郵寄" },
                  { value: "email", label: "電子郵件" },
                  { value: "sms", label: "簡訊" },
                  { value: "phone", label: "電話" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={lead.contactPreferences?.includes(option.value as any) || false}
                      onCheckedChange={(checked) => {
                        const current = lead.contactPreferences || []
                        const updated = checked
                          ? [...current, option.value as any]
                          : current.filter((p) => p !== option.value)
                        setLead({ ...lead, contactPreferences: updated })
                      }}
                    />
                    <Label htmlFor={option.value} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground">
                {lead.contactPreferences && lead.contactPreferences.length > 0
                  ? lead.contactPreferences
                    .map((p) => {
                      const labels: Record<string, string> = {
                        mail: "郵寄",
                        email: "電子郵件",
                        sms: "簡訊",
                        phone: "電話",
                      }
                      return labels[p] || p
                    })
                    .join("、")
                  : "未設定"}
              </p>
            )}
          </div>
        </Card>

        <TestDriveConsentCard
          consent={testDriveConsent}
          onCreateConsent={handleStartTestDrive}
          onModifyInvite={handleModifyTestDriveInvite}
          onViewLicense={handleViewLicense}
        />

        {/* 活動記錄區塊 */}
        <ActivityRecord activities={activities} onAddActivity={() => setIsNewActivityOpen(true)} />

        {/* TODO: 轉換為帳戶按鈕 - 暫時隱藏，之後會重新啟用，請勿刪除此段程式碼 */}
        {/*
        <Button className="w-full" size="lg" onClick={handleConvertedSave}>
          轉換為帳戶
        </Button>
        */}
      </div>

      {/* 新增活動 Sheet */}
      <Sheet open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
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
                  className={`p-4 border rounded-lg text-center transition-colors ${activityType === "event"
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
                  className={`p-4 border rounded-lg text-center transition-colors ${activityType === "task"
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
                      <RadioGroupItem value="not-started" id="lead-not-started" />
                      <Label htmlFor="lead-not-started" className="font-normal">
                        未開始
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-progress" id="lead-in-progress" />
                      <Label htmlFor="lead-in-progress" className="font-normal">
                        進行中
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="completed" id="lead-completed" />
                      <Label htmlFor="lead-completed" className="font-normal">
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

      <Dialog open={isLostDialogOpen} onOpenChange={setIsLostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商機流失原因</DialogTitle>
            <DialogDescription>請說明此商機流失的原因</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 戰敗原因下拉選單 */}
            <div className="space-y-2">
              <Label>戰敗原因</Label>
              <Select value={lostCategory} onValueChange={setLostCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇戰敗原因" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="competitor">購買競牌</SelectItem>
                  <SelectItem value="duplicate">重複資料</SelectItem>
                  <SelectItem value="no-interest">沒有意願購買</SelectItem>
                  <SelectItem value="unreachable">無法聯繫</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 詳細說明 */}
            <div className="space-y-2">
              <Label>商機戰敗原因備註</Label>
              <Textarea
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="輸入流失原因的詳細說明..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleLostCancel}>
              取消
            </Button>
            <Button onClick={handleLostSave} disabled={!lostCategory}>儲存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LeadConversionDialog
        open={isConvertedDialogOpen}
        onOpenChange={setIsConvertedDialogOpen}
        lead={lead}
        onConvert={handleConversion}
        onCancel={handleConvertedCancel}
      />

      {/* Call Record Modal */}
      <Sheet open={isCallRecordOpen} onOpenChange={setIsCallRecordOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>通話紀錄</SheetTitle>
            <p className="text-sm text-muted-foreground">是否要針對本次通話做更新紀錄？</p>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100%-140px)]">
            {/* Voice input button */}
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                size="lg"
                className={`rounded-full w-20 h-20 bg-transparent ${isRecording ? "border-red-500 text-red-500 animate-pulse" : ""}`}
                onClick={handleVoiceRecord}
                disabled={isRecording || isAiProcessing}
              >
                {isRecording ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
              {isRecording ? "錄音中..." : "點擊麥克風開始��音輸入"}
            </p>

            {/* Text area */}
            <div className="flex-1 mb-4">
              <Textarea
                value={callRecordText}
                onChange={(e) => setCallRecordText(e.target.value)}
                placeholder="語音輸入或手動輸入通話紀錄..."
                className="h-full min-h-[150px] resize-none"
              />
            </div>

            {/* AI Process button */}
            {hasRecordedText && (
              <Button
                variant="outline"
                className="mb-4 bg-transparent"
                onClick={handleAiProcess}
                disabled={isAiProcessing || !callRecordText}
              >
                {isAiProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI 整理中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    用 AI 整理
                  </>
                )}
              </Button>
            )}
          </div>

          <SheetFooter className="flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleSkipCallRecord}
            >
              略過
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveCallRecord}
              disabled={!callRecordText}
            >
              儲存紀錄
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Test Drive Consent Modal */}
      <Sheet open={isTestDriveModalOpen} onOpenChange={setIsTestDriveModalOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl px-4 overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>建立試駕同意書</SheetTitle>
          </SheetHeader>

          {testDriveFormStep === "form" ? (
            <div className="space-y-4 pb-8">
              {/* Test Drive Date */}
              <div className="space-y-2">
                <Label>試駕日期</Label>
                <Input
                  type="date"
                  value={testDriveDate}
                  onChange={(e) => setTestDriveDate(e.target.value)}
                />
              </div>

              {/* Test Drive Time */}
              <div className="space-y-2">
                <Label>試駕時間</Label>
                <Input
                  type="time"
                  value={testDriveTime}
                  onChange={(e) => setTestDriveTime(e.target.value)}
                />
              </div>

              {/* Vehicle Brand */}
              <div className="space-y-2">
                <Label>試駕車輛品牌</Label>
                <Select value={testDriveBrand} onValueChange={(value) => {
                  setTestDriveBrand(value)
                  setTestDriveModel("")
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇品牌" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jaguar">Jaguar</SelectItem>
                    <SelectItem value="Land Rover">Land Rover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Model */}
              <div className="space-y-2">
                <Label>試駕車輛型號</Label>
                <Select value={testDriveModel} onValueChange={setTestDriveModel} disabled={!testDriveBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder={testDriveBrand ? "選擇型號" : "請先選擇品牌"} />
                  </SelectTrigger>
                  <SelectContent>
                    {testDriveBrand && brandModels[testDriveBrand]?.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* License Front */}
              <div className="space-y-2">
                <Label>駕���正面</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {licenseFrontPreview ? (
                    <div className="relative">
                      <img src={licenseFrontPreview || "/placeholder.svg"} alt="駕照正面" className="max-h-32 mx-auto rounded" />
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

              {/* License Back */}
              <div className="space-y-2">
                <Label>駕照背面</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {licenseBackPreview ? (
                    <div className="relative">
                      <img src={licenseBackPreview || "/placeholder.svg"} alt="駕照背面" className="max-h-32 mx-auto rounded" />
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
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLicenseBackChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Create QR Button */}
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
            <div className="space-y-4 pb-8">
              {/* QR Code display */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium">客戶邀請 QR Code</p>
                <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
                  <QrCode className="h-20 w-20 text-muted-foreground" />
                </div>
              </div>

              {/* Test drive info */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
                  <span className="text-sm font-medium">{lead.cxpName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">試駕車款</span>
                  <span className="text-sm font-medium">{testDriveBrand} {testDriveModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">試駕時間</span>
                  <span className="text-sm font-medium">{testDriveDate} {testDriveTime}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleEditTestDriveForm}
                >
                  修改邀請資料
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveTestDriveConsent}
                >
                  確認建立
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* License Lightbox */}
      <Dialog open={isLicenseLightboxOpen} onOpenChange={setIsLicenseLightboxOpen}>
        <DialogContent className="max-w-[90vw] p-0 bg-black/90">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
              onClick={() => setIsLicenseLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex flex-col items-center p-4">
              <div className="flex gap-4 mb-4">
                <Button
                  variant={lightboxImageIndex === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLightboxImageIndex(0)}
                  className={lightboxImageIndex !== 0 ? "bg-transparent text-white border-white/30" : ""}
                >
                  正面
                </Button>
                <Button
                  variant={lightboxImageIndex === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLightboxImageIndex(1)}
                  className={lightboxImageIndex !== 1 ? "bg-transparent text-white border-white/30" : ""}
                >
                  反面
                </Button>
              </div>
              <div className="w-full max-h-[70vh] flex items-center justify-center">
                {lightboxImageIndex === 0 ? (
                  <img
                    src={testDriveConsent?.licensePhotoFront || "/generic-identification-card-front.png"}
                    alt="駕照正面"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                ) : (
                  <img
                    src={testDriveConsent?.licensePhotoBack || "/driver-license-back.png"}
                    alt="駕照反面"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                )}
              </div>
              <p className="text-white/70 text-sm mt-4">
                {lightboxImageIndex === 0 ? "駕照正面" : "駕照反面"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
