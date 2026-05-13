"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Edit,
  Car,
  Image as ImageIcon,
} from "lucide-react"
import { getActivityById, getTestDriveConsentById, getLeadById, getAccountById, getOpportunityById } from "@/lib/mock-data"
import type { Activity, EventActivity, TaskActivity, TestDriveConsent } from "@/types"

const taskStatusLabels: Record<string, string> = {
  "not-started": "未開始",
  "in-progress": "進行中",
  "completed": "已完成",
  "waiting": "等待中",
  "deferred": "延期",
}

const taskStatusColors: Record<string, string> = {
  "not-started": "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "completed": "bg-green-100 text-green-700",
  "waiting": "bg-yellow-100 text-yellow-700",
  "deferred": "bg-red-100 text-red-700",
}

export default function ActivityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.id as string

  const [activityData, setActivityData] = useState<{
    activity: Activity
    sourceType: "lead" | "opportunity" | "account"
    sourceId: string
  } | null>(null)
  const [sourceName, setSourceName] = useState<string>("")
  const [testDriveConsent, setTestDriveConsent] = useState<TestDriveConsent | null>(null)

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

      // 如果是事件且有關聯試駕同意書，取得試駕同意書資料
      if (data.activity.type === "event") {
        const eventActivity = data.activity as EventActivity
        if (eventActivity.testDriveConsentId) {
          const consent = getTestDriveConsentById(eventActivity.testDriveConsentId)
          setTestDriveConsent(consent || null)
        }
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
  const eventActivity = isEvent ? (activity as EventActivity) : null
  const taskActivity = !isEvent ? (activity as TaskActivity) : null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} ${formatTime(date)}`
  }

  const getSourceTypeLabel = () => {
    switch (sourceType) {
      case "lead":
        return "商機"
      case "opportunity":
        return "機會"
      case "account":
        return "帳戶"
      default:
        return ""
    }
  }

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

  const handleEdit = () => {
    router.push(`/activities/${activityId}/edit`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(getSourcePath())}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isEvent ? "事件詳情" : "工作詳情"}
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleEdit} className="bg-transparent">
            <Edit className="h-4 w-4 mr-1" />
            編輯
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 pb-8">
        {/* 主要資訊卡片 */}
        <Card className="p-4 space-y-4">
          {/* 活動類型標籤 */}
          <div className="flex items-center gap-2">
            {isEvent ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Calendar className="h-3 w-3 mr-1" />
                事件
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                工作
              </Badge>
            )}
            {taskActivity && (
              <Badge className={taskStatusColors[taskActivity.status]}>
                {taskStatusLabels[taskActivity.status]}
              </Badge>
            )}
          </div>

          {/* 主題 */}
          <div>
            <h2 className="text-xl font-semibold">{activity.subject}</h2>
          </div>

          {/* 來源連結 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">來源：</span>
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => router.push(getSourcePath())}
            >
              {getSourceTypeLabel()} - {sourceName}
            </Button>
          </div>

          {/* 說明 */}
          {activity.description && (
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">說明</Label>
              <p className="text-foreground whitespace-pre-wrap">{activity.description}</p>
            </div>
          )}
        </Card>

        {/* 時間資訊卡片 */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            時間資訊
          </h3>

          {isEvent && eventActivity && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">開始時間</Label>
                  <p className="text-foreground mt-1">{formatDateTime(eventActivity.startDateTime)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">結束時間</Label>
                  <p className="text-foreground mt-1">{formatDateTime(eventActivity.endDateTime)}</p>
                </div>
              </div>
            </>
          )}

          {!isEvent && taskActivity && (
            <div>
              <Label className="text-sm text-muted-foreground">截止日期</Label>
              <p className="text-foreground mt-1">{formatDate(taskActivity.dueDate)}</p>
            </div>
          )}

          <div>
            <Label className="text-sm text-muted-foreground">建立時間</Label>
            <p className="text-foreground mt-1">{formatDate(activity.createdAt)}</p>
          </div>
        </Card>

        {/* 試駕同意書資訊（僅適用於有關聯的事件） */}
        {isEvent && testDriveConsent && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              試駕同意書
            </h3>

            {/* 試駕車款 */}
            <div>
              <Label className="text-sm text-muted-foreground">試駕車款</Label>
              <p className="text-foreground mt-1">
                {testDriveConsent.vehicleBrand} {testDriveConsent.vehicleModel}
              </p>
            </div>

            {/* 試駕日期與時間 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">試駕日期</Label>
                <p className="text-foreground mt-1">
                  {testDriveConsent.testDriveDate ? formatDate(testDriveConsent.testDriveDate) : "未設定"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">試駕時間</Label>
                <p className="text-foreground mt-1">{testDriveConsent.testDriveTime || "未設定"}</p>
              </div>
            </div>

            {/* 客戶填寫時間 */}
            <div>
              <Label className="text-sm text-muted-foreground">客戶填寫時間</Label>
              <p className="text-foreground mt-1">
                {testDriveConsent.submittedAt ? formatDateTime(testDriveConsent.submittedAt) : "尚未填寫"}
              </p>
            </div>

            {/* 駕照照片 */}
            {(testDriveConsent.licensePhotoFront || testDriveConsent.licensePhotoBack) && (
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  駕照照片
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {testDriveConsent.licensePhotoFront && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">正面</p>
                      <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={testDriveConsent.licensePhotoFront}
                          alt="駕照正面"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  {testDriveConsent.licensePhotoBack && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">背面</p>
                      <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={testDriveConsent.licensePhotoBack}
                          alt="駕照背面"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
