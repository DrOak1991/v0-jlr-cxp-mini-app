"use client"

import { useState } from "react"
import type { Activity } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardList, ChevronRight, Plus } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils"

interface ActivityItemCardProps {
  activity: Activity
}

function ActivityItemCard({ activity }: ActivityItemCardProps) {
  const isEvent = activity.type === "event"
  const isTask = activity.type === "task"

  // Status badge styling
  let statusBadgeClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
  let statusLabel = "未開始"

  if (activity.status === "completed") {
    statusBadgeClass = "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    statusLabel = "已完成"
  } else if (activity.status === "in-progress") {
    statusBadgeClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
    statusLabel = "進行中"
  } else if (activity.status === "waiting") {
    statusBadgeClass = "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
    statusLabel = "等待別人"
  }

  // Format date range for events
  const getEventDateRange = () => {
    if (!activity.startDateTime) return ""
    const start = formatDateTime(activity.startDateTime)
    if (activity.endDateTime) {
      const end = formatDateTime(activity.endDateTime)
      return `${start} - ${end}`
    }
    return start
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/30 transition-colors cursor-pointer">
      {/* Left Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        {isEvent ? (
          <Calendar className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{activity.subject}</span>
          {isEvent && (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              事件
            </span>
          )}
          {isTask && activity.status && (
            <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeClass}`}>{statusLabel}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEvent ? getEventDateRange() : activity.dueDate ? `到期：${formatDate(activity.dueDate)}` : ""}
        </p>
      </div>

      {/* Right Arrow */}
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </div>
  )
}

interface ActivityRecordProps {
  activities: Activity[]
  onAddActivity?: () => void
}

export function ActivityRecord({ activities, onAddActivity }: ActivityRecordProps) {
  const [filter, setFilter] = useState<"all" | "event" | "task">("all")

  const filteredActivities = activities.filter((a) => filter === "all" || a.type === filter)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">活動紀錄</h3>
        {onAddActivity && (
          <Button variant="outline" size="sm" className="bg-transparent" onClick={onAddActivity}>
            <Plus className="h-4 w-4 mr-1" />
            新增活動
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-muted rounded-lg p-1 mb-4">
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === "all" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("all")}
        >
          全部
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === "event" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("event")}
        >
          事件
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === "task" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("task")}
        >
          工作
        </button>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {filter === "all" ? "目前沒有活動記錄" : filter === "event" ? "目前沒有事件" : "目前沒有工作"}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <ActivityItemCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </Card>
  )
}
