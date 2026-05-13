"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  X,
  Check,
  ChevronDown,
} from "lucide-react"
import { getActivityById, getLeadById, getAccountById, getOpportunityById } from "@/lib/mock-data"
import type { Activity, EventActivity, TaskActivity, TaskStatus } from "@/types"

// 事件主題建議選項
const eventSubjectSuggestions = [
  "試駕",
  "客戶拜訪",
  "來店賞車",
  "邀約客戶至展示中心",
  "電話諮詢",
  "交車儀式",
  "保養預約",
]

// 工作主題建議選項
const taskSubjectSuggestions = [
  "電話聯繫跟進",
  "發送報價單",
  "準備車型目錄",
  "活動邀約",
  "生日祝福",
  "保養提醒",
  "跟進購車意願",
]

// 帶建議選項的主題輸入元件
function SubjectInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 點擊外部關閉下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const taskStatusLabels: Record<string, string> = {
  "not-started": "未開始",
  "in-progress": "進行中",
  "completed": "已完成",
  "waiting": "等待中",
  "deferred": "延期",
}

export default function ActivityEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const activityId = params.id as string

  const [activityData, setActivityData] = useState<{
    activity: Activity
    sourceType: "lead" | "opportunity" | "account"
    sourceId: string
  } | null>(null)
  const [sourceName, setSourceName] = useState<string>("")

  // 事件表單狀態
  const [eventForm, setEventForm] = useState({
    subject: "",
    description: "",
    startDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
  })

  // 工作表單狀態
  const [taskForm, setTaskForm] = useState({
    subject: "",
    description: "",
    dueDate: undefined as Date | undefined,
    status: "not-started" as TaskStatus,
  })

  useEffect(() => {
    const data = getActivityById(activityId)
    if (data) {
      setActivityData(data)

      // 取得來源名稱
      if (data.sourceType === "lead") {
        const lead = getLeadById(data.sourceId)
        setSourceName(lead?.cxpName || "未知商機")
      } else if (data.sourceType === "opportunity") {
        const opp = getOpportunityById(data.sourceId)
        setSourceName(opp?.name || "未知機會")
      } else if (data.sourceType === "account") {
        const acc = getAccountById(data.sourceId)
        setSourceName(acc?.cxpName || "未知帳戶")
      }

      // 根據活動類型初始化表單
      if (data.activity.type === "event") {
        const event = data.activity as EventActivity
        setEventForm({
          subject: event.subject,
          description: event.description || "",
          startDate: event.startDateTime,
          startTime: event.startDateTime.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          endTime: event.endDateTime.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        })
      } else {
        const task = data.activity as TaskActivity
        setTaskForm({
          subject: task.subject,
          description: task.description || "",
          dueDate: task.dueDate,
          status: task.status,
        })
      }
    }
  }, [activityId])

  if (!activityData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    )
  }

  const { activity, sourceType, sourceId } = activityData
  const isEvent = activity.type === "event"

  const getSourcePath = () => {
    switch (sourceType) {
      case "lead":
        return `/leads/${sourceId}`
      case "opportunity":
        return `/opportunities/${sourceId}`
      case "account":
        return `/accounts/${sourceId}`
      default:
        return "/"
    }
  }

  const handleCancel = () => {
    router.push(`/activities/${activityId}`)
  }

  const handleSave = () => {
    // 驗證必填欄位
    if (isEvent) {
      if (!eventForm.subject.trim() || !eventForm.startDate || !eventForm.startTime) {
        toast({
          title: "請填寫必填欄位",
          description: "主題、日期和開始時間為必填",
          variant: "destructive",
        })
        return
      }
    } else {
      if (!taskForm.subject.trim() || !taskForm.dueDate) {
        toast({
          title: "請填寫必填欄位",
          description: "主題和截止日期為必填",
          variant: "destructive",
        })
        return
      }
    }

    // 模擬儲存成功
    toast({
      title: "儲存成功",
      description: isEvent ? "事件已更新" : "工作已更新",
    })
    router.push(`/activities/${activityId}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              編輯{isEvent ? "事件" : "工作"}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 pb-24">
        {/* 活動類型顯示（不可編輯） */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">活動類型</Label>
            {isEvent ? (
              <div className="flex items-center gap-1 text-blue-600">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">事件</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">工作</span>
              </div>
            )}
          </div>
        </Card>

        {/* 事件編輯表單 */}
        {isEvent && (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>
                主題 <span className="text-destructive">*</span>
              </Label>
              <SubjectInput
                value={eventForm.subject}
                onChange={(value) => setEventForm({ ...eventForm, subject: value })}
                suggestions={eventSubjectSuggestions}
                placeholder="例如：客戶拜訪"
              />
            </div>

            <div className="space-y-2">
              <Label>說明</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="輸入詳細說明..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>
                日期 <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={eventForm.startDate}
                onDateChange={(date) => setEventForm({ ...eventForm, startDate: date })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  開始時間 <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>結束時間</Label>
                <Input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* 工作編輯表單 */}
        {!isEvent && (
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>
                主題 <span className="text-destructive">*</span>
              </Label>
              <SubjectInput
                value={taskForm.subject}
                onChange={(value) => setTaskForm({ ...taskForm, subject: value })}
                suggestions={taskSubjectSuggestions}
                placeholder="例如：準備報價單"
              />
            </div>

            <div className="space-y-2">
              <Label>說明</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="輸入詳細說明..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>
                截止日期 <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={taskForm.dueDate}
                onDateChange={(date) => setTaskForm({ ...taskForm, dueDate: date })}
              />
            </div>
          </Card>
        )}
      </div>

      {/* 底部操作列 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
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
    </div>
  )
}
