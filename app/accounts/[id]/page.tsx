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
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Edit,
  X,
  Check,
  PhoneCall,
  MailIcon,
  AlertCircle,
  Plus,
} from "lucide-react"
import type { Account, Activity } from "@/types"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"

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
    type: "call",
    content: "提醒保養時間",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "2",
    type: "meeting",
    content: "完成交車",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "3",
    type: "note",
    content: "客戶已簽約",
    createdAt: new Date("2024-02-01"),
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

  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    name: "",
    dueDate: undefined as Date | undefined,
    notes: "",
    status: "not-started" as "not-started" | "in-progress" | "completed",
  })

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

  const handleCreateActivity = () => {
    if (!newActivity.name || !newActivity.dueDate) {
      toast({
        title: "請填寫必填欄位",
        description: "活動名稱和截止日期為必填",
        variant: "destructive",
      })
      return
    }

    const activity: Activity = {
      id: Date.now().toString(),
      type: "task",
      content: newActivity.name,
      createdAt: new Date(),
      name: newActivity.name,
      dueDate: newActivity.dueDate,
      notes: newActivity.notes,
      status: newActivity.status,
    }

    setActivities([activity, ...activities])
    setIsNewActivityOpen(false)
    setNewActivity({
      name: "",
      dueDate: undefined,
      notes: "",
      status: "not-started",
    })

    toast({
      title: "活動已新增",
      description: "新活動已成功建立",
    })
  }

  const activityIcons = {
    call: PhoneCall,
    email: MailIcon,
    note: MessageCircle,
    meeting: Calendar,
    task: Calendar,
  }

  const statusLabels = {
    "not-started": "未開始",
    "in-progress": "進行中",
    completed: "完成",
  }

  // Show loading state until client-side hydration is complete
  if (!isMounted || !account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
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

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base">活動記錄</h3>
            <Button variant="outline" size="sm" onClick={() => setIsNewActivityOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              新增活動
            </Button>
          </div>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    {activity.type === "task" && activity.name && (
                      <p className="text-sm font-medium text-foreground">{activity.name}</p>
                    )}
                    <p className="text-sm text-foreground">{activity.content}</p>
                    {activity.type === "task" && (
                      <div className="flex items-center gap-2 mt-1">
                        {activity.dueDate && (
                          <span className="text-xs text-muted-foreground">截止：{formatDate(activity.dueDate)}</span>
                        )}
                        {activity.status && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              activity.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : activity.status === "in-progress"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {statusLabels[activity.status]}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Sheet open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>新增活動</SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="activity-name">
                活動名稱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="activity-name"
                value={newActivity.name}
                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                placeholder="輸入活動名稱"
                className="mt-1"
              />
            </div>

            <div>
              <Label>
                截止日期 <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={newActivity.dueDate}
                onDateChange={(date) => setNewActivity({ ...newActivity, dueDate: date })}
              />
            </div>

            <div>
              <Label htmlFor="activity-notes">備註</Label>
              <Textarea
                id="activity-notes"
                value={newActivity.notes}
                onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                placeholder="輸入備註..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="mb-2 block">狀態</Label>
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
                  <RadioGroupItem value="not-started" id="not-started" />
                  <Label htmlFor="not-started" className="font-normal">
                    未開始
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in-progress" id="in-progress" />
                  <Label htmlFor="in-progress" className="font-normal">
                    進行中
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed" className="font-normal">
                    完成
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsNewActivityOpen(false)} className="flex-1">
              取消
            </Button>
            <Button onClick={handleCreateActivity} className="flex-1">
              建立活動
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
