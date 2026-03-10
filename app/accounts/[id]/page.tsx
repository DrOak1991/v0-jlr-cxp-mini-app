"use client"

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Edit,
  X,
  Check,

  AlertCircle,
  Plus,
  ClipboardList,
  ChevronRight,
} from "lucide-react"
import type { Account, Activity, EventActivity, TaskActivity, TaskStatus } from "@/types"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { DatePicker, DateTimePicker } from "@/components/date-picker"

// Mock data
const mockAccount: Account = {
  id: "1",
  cxpName: "王小明",
  lineName: "小明的LINE",
  lineStatus: "joined",
  phone: "0912-345-678",
  email: "wang@example.com",
  convertedAt: new Date("2024-02-01"),
  birthday: new Date("1990-05-20"),
  carType: "new",
  interestedModel: "range-rover-sport",
  performancePreference: true,
  leadSource: "walk-in",
  contactPreferences: ["email", "phone"],
  notes: "已購買 Range Rover Sport，定期追蹤保養需求。",
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "event",
    subject: "新車交車典禮",
    description: "Range Rover Sport 交車，準備交車禮品",
    startDateTime: new Date("2024-03-15T10:00:00"),
    endDateTime: new Date("2024-03-15T12:00:00"),
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "2",
    type: "task",
    subject: "跟進保養預約",
    description: "聯繫客戶確認首次保養時間",
    dueDate: new Date("2024-03-20"),
    status: "in-progress",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    type: "event",
    subject: "試駕體驗活動",
    description: "邀請客戶參加新車款試駕活動",
    startDateTime: new Date("2024-02-28T14:00:00"),
    endDateTime: new Date("2024-02-28T16:30:00"),
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "4",
    type: "task",
    subject: "準備報價單",
    description: "準備 Defender 110 配件報價",
    dueDate: new Date("2024-02-25"),
    status: "completed",
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "5",
    type: "task",
    subject: "等待財務審核",
    description: "貸款申請已送出，等待銀行回覆",
    dueDate: new Date("2024-03-05"),
    status: "waiting",
    createdAt: new Date("2024-02-05"),
  },
]

export default function AccountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [isMounted, setIsMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [originalAccount, setOriginalAccount] = useState<Account | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  const [notes, setNotes] = useState("")
  const [originalNotes, setOriginalNotes] = useState("")
  const [hasNotesChanged, setHasNotesChanged] = useState(false)
  const [hasFieldsChanged, setHasFieldsChanged] = useState(false)

  const [activeTab, setActiveTab] = useState<"all" | "event" | "task">("all")

  // New Event Sheet
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    subject: "",
    description: "",
    startDateTime: undefined as Date | undefined,
    endDateTime: undefined as Date | undefined,
  })

  // New Task Sheet
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    subject: "",
    description: "",
    dueDate: undefined as Date | undefined,
    status: "not-started" as TaskStatus,
  })

  // Edit Sheet
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  // Initialize data on client-side only to prevent hydration mismatch
  useEffect(() => {
    setAccount(mockAccount)
    setOriginalAccount(mockAccount)
    setActivities(mockActivities)
    setNotes(mockAccount.notes || "")
    setOriginalNotes(mockAccount.notes || "")
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      setHasNotesChanged(notes !== originalNotes)
    }
  }, [notes, originalNotes, isMounted])

  useEffect(() => {
    if (isEditing && account && originalAccount) {
      setHasFieldsChanged(JSON.stringify(account) !== JSON.stringify(originalAccount))
    }
  }, [account, originalAccount, isEditing])

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

  const handleSaveNotes = () => {
    console.log("[v0] Save notes:", notes)
    setOriginalNotes(notes)
    setHasNotesChanged(false)
    toast({
      title: "備註已儲存",
      description: "您的備註已成功更新",
    })
  }

  const handleEdit = () => {
    if (account) {
      setOriginalAccount({ ...account })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (account) {
      console.log("[v0] Save account:", account)
      setOriginalAccount({ ...account })
      setIsEditing(false)
      setHasFieldsChanged(false)
      toast({
        title: "資料已更新",
        description: "客戶資訊已成功儲存",
      })
    }
  }

  const handleCancel = () => {
    if (originalAccount) {
      setAccount({ ...originalAccount })
      setIsEditing(false)
      setHasFieldsChanged(false)
    }
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
    window.location.href = `tel:${account.phone}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${account.email}`
  }

  const handleInvite = async () => {
    const inviteUrl = `https://example.com/invite/${account.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "邀請加入 LINE",
          text: `邀請 ${account.cxpName} 加入 LINE 好友`,
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

  const handleCreateEvent = () => {
    if (!newEvent.subject || !newEvent.startDateTime || !newEvent.endDateTime) {
      toast({
        title: "請填寫必填欄位",
        description: "主題、開始時間和結束時間為必填",
        variant: "destructive",
      })
      return
    }

    const event: EventActivity = {
      id: Date.now().toString(),
      type: "event",
      subject: newEvent.subject,
      description: newEvent.description || undefined,
      startDateTime: newEvent.startDateTime,
      endDateTime: newEvent.endDateTime,
      createdAt: new Date(),
    }

    setActivities([event, ...activities])
    setIsNewEventOpen(false)
    setNewEvent({ subject: "", description: "", startDateTime: undefined, endDateTime: undefined })
    toast({ title: "事件已新增", description: "新事件已成功建立" })
  }

  const handleCreateTask = () => {
    if (!newTask.subject || !newTask.dueDate) {
      toast({
        title: "請填寫必填欄位",
        description: "主題和到期日期為必填",
        variant: "destructive",
      })
      return
    }

    const task: TaskActivity = {
      id: Date.now().toString(),
      type: "task",
      subject: newTask.subject,
      description: newTask.description || undefined,
      dueDate: newTask.dueDate,
      status: newTask.status,
      createdAt: new Date(),
    }

    setActivities([task, ...activities])
    setIsNewTaskOpen(false)
    setNewTask({ subject: "", description: "", dueDate: undefined, status: "not-started" })
    toast({ title: "工作已新增", description: "新工作已成功建立" })
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity({ ...activity })
    setIsEditActivityOpen(true)
  }

  const handleSaveEditedActivity = () => {
    if (!editingActivity) return

    if (editingActivity.type === "event") {
      if (!editingActivity.subject || !editingActivity.startDateTime || !editingActivity.endDateTime) {
        toast({ title: "請填寫必填欄位", description: "主題、開始時間和結束時間為必填", variant: "destructive" })
        return
      }
    } else {
      if (!editingActivity.subject || !editingActivity.dueDate) {
        toast({ title: "請填寫必填欄位", description: "主題和到期日期為必填", variant: "destructive" })
        return
      }
    }

    setActivities(activities.map((a) => (a.id === editingActivity.id ? editingActivity : a)))
    setIsEditActivityOpen(false)
    setEditingActivity(null)
    toast({ title: "活動已更新", description: "活動資訊已成功儲存" })
  }

  const taskStatusLabels: Record<TaskStatus, string> = {
    "not-started": "沒有開始",
    "in-progress": "進行中",
    completed: "已完成",
    waiting: "等待別人",
    deferred: "延期",
  }

  const taskStatusColors: Record<TaskStatus, string> = {
    "not-started": "bg-secondary text-secondary-foreground",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    waiting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    deferred: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }

  const filteredActivities = activities.filter((a) => {
    if (activeTab === "all") return true
    return a.type === activeTab
  })

  // Show loading state until client-side hydration is complete
  if (!isMounted || !account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">帳戶詳情</h1>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-5 w-5" />
            </Button>
          )}
          {isEditing && <div className="w-10" />}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Basic Info Card */}
        <Card className="p-4">
          <h2 className="text-2xl font-bold mb-4">{account.cxpName}</h2>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-2" />
              撥打
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              郵件
            </Button>
            {account.lineStatus === "not-joined" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent border-green-600 text-green-600 hover:bg-green-50"
                onClick={handleInvite}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                邀請
              </Button>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MessageCircle
                className={`h-4 w-4 ${account.lineStatus === "joined" ? "text-green-600" : "text-muted-foreground"}`}
              />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">LINE</span>
                <p className="text-foreground">{account.lineStatus === "joined" ? account.lineName : "未加入"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">電話</span>
                {isEditing ? (
                  <Input
                    value={account.phone}
                    onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                    placeholder="輸入電話號碼"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-foreground">{account.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Email</span>
                {isEditing ? (
                  <Input
                    type="email"
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                    placeholder="輸入 Email"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-foreground break-all">{account.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">轉換時間</span>
                <p className="text-foreground">{formatDate(account.convertedAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <Label className="text-base font-semibold mb-2 block">備註</Label>

          {hasNotesChanged && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">有未儲存的變更</span>
            </div>
          )}

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="新增備註..."
            className="min-h-[120px] mb-3"
          />

          <Button onClick={handleSaveNotes} disabled={!hasNotesChanged} className="w-full" size="sm">
            儲存備註
          </Button>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-base">客戶資訊</h3>

          {/* Birthday */}
          <div>
            <Label className="text-sm text-muted-foreground">客戶生日</Label>
            {isEditing ? (
              <input
                type="date"
                value={account.birthday ? account.birthday.toISOString().split("T")[0] : ""}
                onChange={(e) => setAccount({ ...account, birthday: new Date(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              />
            ) : (
              <p className="text-foreground mt-1">{account.birthday ? formatDate(account.birthday) : "未設定"}</p>
            )}
          </div>

          {/* Car Type */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">客戶購車類型</Label>
            {isEditing ? (
              <RadioGroup
                value={account.carType || ""}
                onValueChange={(value) => setAccount({ ...account, carType: value as "new" | "certified-used" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="font-normal">
                    新車
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="certified-used" id="certified-used" />
                  <Label htmlFor="certified-used" className="font-normal">
                    認證中古車
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <p className="text-foreground">
                {account.carType === "new" ? "新車" : account.carType === "certified-used" ? "認證中古車" : "未設定"}
              </p>
            )}
          </div>

          {/* Interested Model */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">客戶最感興趣的車型</Label>
            {isEditing ? (
              <RadioGroup
                value={account.interestedModel || ""}
                onValueChange={(value) =>
                  setAccount({
                    ...account,
                    interestedModel: value as "defender-90" | "range-rover-sport" | "i-pace",
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="defender-90" id="defender-90" />
                  <Label htmlFor="defender-90" className="font-normal">
                    Defender 90
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range-rover-sport" id="range-rover-sport" />
                  <Label htmlFor="range-rover-sport" className="font-normal">
                    Range Rover Sport
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="i-pace" id="i-pace" />
                  <Label htmlFor="i-pace" className="font-normal">
                    I-PACE
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <p className="text-foreground">
                {account.interestedModel === "defender-90"
                  ? "Defender 90"
                  : account.interestedModel === "range-rover-sport"
                    ? "Range Rover Sport"
                    : account.interestedModel === "i-pace"
                      ? "I-PACE"
                      : "未設定"}
              </p>
            )}
          </div>

          {/* Performance Preference */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">性能車款偏好</Label>
            {isEditing ? (
              <Switch
                checked={account.performancePreference || false}
                onCheckedChange={(checked) => setAccount({ ...account, performancePreference: checked })}
              />
            ) : (
              <p className="text-foreground">{account.performancePreference ? "是" : "否"}</p>
            )}
          </div>

          {/* Lead Source */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">商機來源</Label>
            {isEditing ? (
              <RadioGroup
                value={account.leadSource || ""}
                onValueChange={(value) =>
                  setAccount({
                    ...account,
                    leadSource: value as "walk-in" | "referral" | "retailer-experience",
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="walk-in" id="walk-in" />
                  <Label htmlFor="walk-in" className="font-normal">
                    來店客 (Walk-in)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="referral" id="referral" />
                  <Label htmlFor="referral" className="font-normal">
                    轉介 (Referral)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retailer-experience" id="retailer-experience" />
                  <Label htmlFor="retailer-experience" className="font-normal">
                    經銷商外展 / 體驗活動
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <p className="text-foreground">
                {account.leadSource === "walk-in"
                  ? "來店客 (Walk-in)"
                  : account.leadSource === "referral"
                    ? "轉介 (Referral)"
                    : account.leadSource === "retailer-experience"
                      ? "經銷商外展 / 體驗活動"
                      : "未設定"}
              </p>
            )}
          </div>

          {/* Contact Preferences */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">客戶願意接受的聯絡管道</Label>
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
                      checked={account.contactPreferences?.includes(option.value as any) || false}
                      onCheckedChange={(checked) => {
                        const current = account.contactPreferences || []
                        const updated = checked
                          ? [...current, option.value as any]
                          : current.filter((p) => p !== option.value)
                        setAccount({ ...account, contactPreferences: updated })
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
                {account.contactPreferences && account.contactPreferences.length > 0
                  ? account.contactPreferences
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

        {/* Activity Records */}
        <Card className="p-4">
          <h3 className="font-semibold text-base mb-3">活動紀錄</h3>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "event" | "task")}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="all" className="flex-1">全部</TabsTrigger>
              <TabsTrigger value="event" className="flex-1">事件</TabsTrigger>
              <TabsTrigger value="task" className="flex-1">工作</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-2">
                {filteredActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {activeTab === "all" ? "尚無活動紀錄" : activeTab === "event" ? "尚無事件" : "尚無工作"}
                  </p>
                ) : (
                  filteredActivities.map((activity) => (
                    <button
                      key={activity.id}
                      type="button"
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left"
                      onClick={() => handleEditActivity(activity)}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                        {activity.type === "event" ? (
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{activity.subject}</p>
                          {activity.type === "event" ? (
                            <Badge variant="outline" className="shrink-0 text-xs">事件</Badge>
                          ) : (
                            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${taskStatusColors[activity.status]}`}>
                              {taskStatusLabels[activity.status]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.type === "event"
                            ? `${formatDateTime(activity.startDateTime)} - ${formatDateTime(activity.endDateTime)}`
                            : `到期：${formatDate(activity.dueDate)}`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsNewEventOpen(true)}>
              <Calendar className="h-4 w-4 mr-1" />
              新增事件
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsNewTaskOpen(true)}>
              <ClipboardList className="h-4 w-4 mr-1" />
              新增工作
            </Button>
          </div>
        </Card>
      </div>

      {/* New Event Sheet */}
      <Sheet open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>新增事件</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="event-subject">
                主題 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="event-subject"
                value={newEvent.subject}
                onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                placeholder="輸入事件主題"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-description">描述</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="輸入描述..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label>
                開始日期時間 <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1">
                <DateTimePicker
                  date={newEvent.startDateTime}
                  onDateChange={(date) => setNewEvent({ ...newEvent, startDateTime: date })}
                  placeholder="選擇開始時間"
                />
              </div>
            </div>
            <div>
              <Label>
                結束日期時間 <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1">
                <DateTimePicker
                  date={newEvent.endDateTime}
                  onDateChange={(date) => setNewEvent({ ...newEvent, endDateTime: date })}
                  placeholder="選擇結束時間"
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsNewEventOpen(false)} className="flex-1">
              取消
            </Button>
            <Button onClick={handleCreateEvent} className="flex-1">
              建立事件
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* New Task Sheet */}
      <Sheet open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>新增工作</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="task-subject">
                主題 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-subject"
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                placeholder="輸入工作主題"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="task-description">描述</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="輸入描述..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label>
                到期日期 <span className="text-destructive">*</span>
              </Label>
              <div className="mt-1">
                <DatePicker
                  date={newTask.dueDate}
                  onDateChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                  placeholder="選擇到期日期"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">狀態</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) => setNewTask({ ...newTask, status: value as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">沒有開始</SelectItem>
                  <SelectItem value="in-progress">進行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="waiting">等待別人</SelectItem>
                  <SelectItem value="deferred">延期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)} className="flex-1">
              取消
            </Button>
            <Button onClick={handleCreateTask} className="flex-1">
              建立工作
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Activity Sheet */}
      <Sheet open={isEditActivityOpen} onOpenChange={(open) => {
        setIsEditActivityOpen(open)
        if (!open) setEditingActivity(null)
      }}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingActivity?.type === "event" ? "編輯事件" : "編輯工作"}</SheetTitle>
          </SheetHeader>
          {editingActivity && (
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="edit-subject">
                  主題 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-subject"
                  value={editingActivity.subject}
                  onChange={(e) => setEditingActivity({ ...editingActivity, subject: e.target.value })}
                  placeholder="輸入主題"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={editingActivity.description || ""}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  placeholder="輸入描述..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {editingActivity.type === "event" ? (
                <>
                  <div>
                    <Label>
                      開始日期時間 <span className="text-destructive">*</span>
                    </Label>
                    <div className="mt-1">
                      <DateTimePicker
                        date={editingActivity.startDateTime}
                        onDateChange={(date) =>
                          setEditingActivity({ ...editingActivity, startDateTime: date! } as EventActivity)
                        }
                        placeholder="選擇開始時間"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>
                      結束日期時間 <span className="text-destructive">*</span>
                    </Label>
                    <div className="mt-1">
                      <DateTimePicker
                        date={editingActivity.endDateTime}
                        onDateChange={(date) =>
                          setEditingActivity({ ...editingActivity, endDateTime: date! } as EventActivity)
                        }
                        placeholder="選擇結束時間"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>
                      到期日期 <span className="text-destructive">*</span>
                    </Label>
                    <div className="mt-1">
                      <DatePicker
                        date={editingActivity.dueDate}
                        onDateChange={(date) =>
                          setEditingActivity({ ...editingActivity, dueDate: date! } as TaskActivity)
                        }
                        placeholder="選擇到期日期"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">狀態</Label>
                    <Select
                      value={editingActivity.status}
                      onValueChange={(value) =>
                        setEditingActivity({ ...editingActivity, status: value as TaskStatus } as TaskActivity)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">沒有開始</SelectItem>
                        <SelectItem value="in-progress">進行中</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="waiting">等待別人</SelectItem>
                        <SelectItem value="deferred">延期</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
          <SheetFooter>
            <Button variant="outline" onClick={() => { setIsEditActivityOpen(false); setEditingActivity(null) }} className="flex-1">
              取消
            </Button>
            <Button onClick={handleSaveEditedActivity} className="flex-1">
              儲存變更
            </Button>
          </SheetFooter>
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
