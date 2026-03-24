"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Car, QrCode, Eye, Check, CreditCard } from "lucide-react"
import type { TestDriveConsent } from "@/types"

interface TestDriveConsentCardProps {
  consent: TestDriveConsent | null
  onCreateConsent: () => void
  onModifyInvite?: () => void
  onViewLicense?: (index: number) => void
}

export function TestDriveConsentCard({
  consent,
  onCreateConsent,
  onModifyInvite,
  onViewLicense,
}: TestDriveConsentCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatTestDriveDateTime = (date?: Date, time?: string) => {
    if (!date) return "未設定"
    const dateStr = formatDate(date)
    return time ? `${dateStr} ${time}` : dateStr
  }

  const handleViewLicense = (index: number) => {
    if (onViewLicense) {
      onViewLicense(index)
    }
  }

  const handleModifyInvite = () => {
    if (onModifyInvite) {
      onModifyInvite()
    }
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        試駕同意書狀態
      </h3>

      {!consent && (
        // State 1: Empty - no test drive consent yet
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">尚未建立試駕同意書</p>
          <Button onClick={onCreateConsent} className="w-full">
            <Car className="h-4 w-4 mr-2" />
            建立試駕同意書
          </Button>
        </div>
      )}

      {consent && consent.status === "pending" && (
        // State 2: Pending - QR code generated, waiting for customer
        <div className="space-y-4">
          {/* Test drive info */}
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">試駕車款</span>
              <span className="text-sm font-medium">{consent.vehicleModel || "未設定"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">試駕時間</span>
              <span className="text-sm font-medium">
                {formatTestDriveDateTime(consent.testDriveDate, consent.testDriveTime)}
              </span>
            </div>
          </div>

          <p className="text-sm font-medium text-muted-foreground">客戶邀請 QR Code</p>
          <p className="text-sm text-muted-foreground">
            QR Code 生成時間：{formatDate(consent.generatedAt)}
          </p>
          <div className="flex justify-center">
            <div className="p-4 bg-white border border-border rounded-lg">
              <div className="w-40 h-40 bg-muted rounded flex items-center justify-center">
                <QrCode className="h-20 w-20 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleModifyInvite} className="flex-1 bg-transparent">
              修改邀請資料
            </Button>
            <Button variant="outline" onClick={() => handleViewLicense(0)} className="flex-1 bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              檢視駕照資料
            </Button>
          </div>
        </div>
      )}

      {consent && consent.status === "completed" && (
        // State 3: Completed - customer confirmed and uploaded license
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">已完成填寫</span>
          </div>
          <p className="text-sm text-muted-foreground">
            填寫時間：{consent.submittedAt ? formatDate(consent.submittedAt) : "未知"}
          </p>

          {/* Test drive info */}
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">試駕車款</span>
              <span className="text-sm font-medium">{consent.vehicleModel || "未設定"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">試駕時間</span>
              <span className="text-sm font-medium">
                {formatTestDriveDateTime(consent.testDriveDate, consent.testDriveTime)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">駕照照片</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="border border-border rounded-lg p-3 flex flex-col items-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewLicense(0)}
              >
                <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-2">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">正面</span>
              </button>
              <button
                type="button"
                className="border border-border rounded-lg p-3 flex flex-col items-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewLicense(1)}
              >
                <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-2">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">反面</span>
              </button>
            </div>
          </div>

          <Button onClick={onCreateConsent} className="w-full">
            <Car className="h-4 w-4 mr-2" />
            重新填寫試駕同意書
          </Button>
        </div>
      )}
    </Card>
  )
}
