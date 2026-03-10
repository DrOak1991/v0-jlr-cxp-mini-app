"use client"
import { useState } from "react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ date, onDateChange, placeholder = "選擇日期" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: zhTW }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({ date, onDateChange, placeholder = "選擇日期與時間" }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hours = date ? String(date.getHours()).padStart(2, "0") : "09"
  const minutes = date ? String(date.getMinutes()).padStart(2, "0") : "00"

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) {
      onDateChange(undefined)
      return
    }
    const newDate = new Date(selectedDay)
    if (date) {
      newDate.setHours(date.getHours(), date.getMinutes())
    } else {
      newDate.setHours(9, 0)
    }
    onDateChange(newDate)
  }

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return

    const current = date ? new Date(date) : new Date()
    if (!date) {
      current.setSeconds(0, 0)
    }

    if (type === "hours") {
      const clamped = Math.max(0, Math.min(23, num))
      current.setHours(clamped)
    } else {
      const clamped = Math.max(0, Math.min(59, num))
      current.setMinutes(clamped)
    }
    onDateChange(current)
  }

  const displayText = date
    ? `${format(date, "PPP", { locale: zhTW })} ${hours}:${minutes}`
    : placeholder

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
        <div className="border-t border-border px-3 py-3">
          <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <Clock className="h-3 w-3" />
            時間
          </Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => handleTimeChange("hours", e.target.value)}
              className="w-16 text-center"
              aria-label="小時"
            />
            <span className="text-foreground font-medium">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => handleTimeChange("minutes", e.target.value)}
              className="w-16 text-center"
              aria-label="分鐘"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
