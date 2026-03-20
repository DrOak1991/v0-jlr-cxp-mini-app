"use client"

import type React from "react"
import { useState, useEffect } from "react"

import type { Account } from "@/types"
import { Card } from "@/components/ui/card"
import { Phone, Mail, Calendar, MessageCircle, ArrowRight, UserX, FileCheck, Copy, Check, Upload, Car } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = `https://example.com/invite/${account.id}`
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

  // Model options based on brand
  const brandModels: Record<string, string[]> = {
    "Jaguar": ["F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XF", "XE"],
    "Land Rover": ["Defender 90", "Defender 110", "Defender 130", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Discovery", "Discovery Sport"]
  }

  // Reset states when sheet opens
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

  const handleInvite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsInviteSheetOpen(true)
  }

  const handleCopyMessage = async () => {
    try {
      const fullMessage = `${inviteMessage}\n${inviteUrl}`
      await navigator.clipboard.writeText(fullMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log("[v0] Copy failed:", err)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log("[v0] Copy failed:", err)
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

  return (
    <>
      <Link href={`/accounts/${account.id}`} className="block">
        <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
        <div className="flex gap-3 mb-3">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <Avatar className="h-12 w-12">
              {account.lineStatus === "joined" && account.avatarUrl && (
                <AvatarImage src={account.avatarUrl || "/placeholder.svg"} alt={account.cxpName} />
              )}
              <AvatarFallback
                className={
                  account.lineStatus === "joined"
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "bg-gray-100 text-gray-400"
                }
              >
                {account.lineStatus === "joined" ? getInitials(account.cxpName) : <UserX className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>

            {/* Test drive consent status indicator */}
            <div className="flex items-center gap-1">
              <FileCheck
                className={`h-4 w-4 ${
                  account.testDriveConsent?.submittedAt ? "text-green-600 fill-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs ${
                  account.testDriveConsent?.submittedAt ? "text-green-600 font-medium" : "text-gray-400"
                }`}
              >
                {account.testDriveConsent?.submittedAt ? "已填" : "未填"}
              </span>
            </div>
          </div>

          {/* Content section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base mb-1">{account.cxpName}</h3>
                <div className="flex items-center gap-1.5 text-sm">
                  <MessageCircle
                    className={`h-3.5 w-3.5 shrink-0 ${account.lineStatus === "joined" ? "text-green-600" : "text-muted-foreground"}`}
                  />
                  <span className={account.lineStatus === "joined" ? "text-foreground" : "text-muted-foreground"}>
                    {account.lineStatus === "joined" ? account.lineName : "未加入"}
                  </span>
                </div>
              </div>
              {account.lineStatus === "not-joined" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-green-600 text-green-600 hover:bg-green-50 bg-transparent shrink-0"
                  onClick={handleInvite}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  邀請
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{account.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{account.email}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>轉換：{formatDate(account.convertedAt)}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </Card>
      </Link>

      <Sheet open={isInviteSheetOpen} onOpenChange={setIsInviteSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-xl px-4 h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>邀請 {account.cxpName} 加入 LINE</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="test-drive" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="test-drive">試駕邀請</TabsTrigger>
              <TabsTrigger value="direct">直接邀請</TabsTrigger>
            </TabsList>

            {/* Test Drive Invite Tab */}
            <TabsContent value="test-drive" className="space-y-4">
              {testDriveStep === "form" ? (
                <div className="space-y-4">
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
                    <Label>駕照正面</Label>
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
                <div className="space-y-4">
                  {/* QR Code display */}
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

                  {/* Test drive info */}
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
                      <span className="text-sm font-medium">{account.cxpName}</span>
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

                  {/* Edit button */}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleEditTestDrive}
                  >
                    修改邀請資料
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Direct Invite Tab */}
            <TabsContent value="direct" className="space-y-6">
              {/* QR Code section */}
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

              {/* Editable invite message section */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">編輯邀請訊息</p>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="min-h-[100px] text-sm"
                  placeholder="輸入邀請訊息..."
                />
                
                {/* Readonly URL display */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">邀請連結</p>
                  <Input 
                    value={inviteUrl} 
                    readOnly 
                    className="text-sm bg-muted text-muted-foreground cursor-not-allowed" 
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleCopyMessage}
                >
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
        </SheetContent>
      </Sheet>
    </>
  )
}
