"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAccountById } from "@/lib/mock-data"

function NewOpportunityContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get accountId from URL params
  const accountId = searchParams.get("accountId")

  // Account data
  const [accountName, setAccountName] = useState("")

  useEffect(() => {
    if (accountId) {
      const account = getAccountById(accountId)
      if (account) {
        setAccountName(account.name)
      }
    }
  }, [accountId])

  // Form state
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [stage, setStage] = useState<string>("prospecting")
  const [carType, setCarType] = useState<string>("")
  const [detailCategory, setDetailCategory] = useState<string>("")
  const [interestedModel, setInterestedModel] = useState<string>("")
  const [powerType, setPowerType] = useState<string>("")
  const [vistaOrderNumber, setVistaOrderNumber] = useState<string>("")
  const [currentVehicleBrand, setCurrentVehicleBrand] = useState<string>("")
  const [currentVehicle, setCurrentVehicle] = useState<string>("")
  const [orderDate, setOrderDate] = useState<string>("")
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [leadSource, setLeadSource] = useState<string>("")
  const [interestedSvV8, setInterestedSvV8] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "請輸入機會名稱"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "表單驗證失敗",
        description: "請檢查必填欄位",
        variant: "destructive",
      })
      return
    }

    // In real app, would call API to create opportunity
    toast({
      title: "機會已建立",
      description: `已成功建立機會：${name}`,
    })

    // Navigate back to account detail or opportunities list
    if (accountId) {
      router.push(`/accounts/${accountId}`)
    } else {
      router.push("/opportunities")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate">新增機會</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本資訊 */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-base">基本資訊</h3>

            {/* 關聯帳戶 */}
            {accountName && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">關聯帳戶</Label>
                <p className="text-foreground font-medium">{accountName}</p>
              </div>
            )}

            {/* 機會名稱 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                機會名稱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入機會名稱"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* 機會階段 */}
            <div className="space-y-2">
              <Label>機會階段</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇階段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact">聯繫</SelectItem>
                  <SelectItem value="test-drive">試駕</SelectItem>
                  <SelectItem value="vehicle-selection">車型選擇</SelectItem>
                  <SelectItem value="trade-in">舊車處理</SelectItem>
                  <SelectItem value="negotiation">談判</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground leading-relaxed">
                目前在 CXP Mini App 之中，只支援更新到談判階段，後續銷售階段請回到 CXP 桌面版進行。
              </p>
            </div>

            {/* 訂購日期 */}
            <div className="space-y-2">
              <Label>訂購日期</Label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>

            {/* 交車日期 */}
            <div className="space-y-2">
              <Label>交車日期</Label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </Card>

          {/* 車型選擇 */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Car className="h-5 w-5" />
              車型選擇
            </h3>

            {/* 購車方式 */}
            <div className="space-y-2">
              <Label>購車方式</Label>
              <Select value={carType} onValueChange={setCarType}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-car">新車</SelectItem>
                  <SelectItem value="certified-used">認證中古車</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 次要形式 */}
            <div className="space-y-2">
              <Label>次要形式</Label>
              <Select value={detailCategory} onValueChange={setDetailCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">零售</SelectItem>
                  <SelectItem value="lease">租賃</SelectItem>
                  <SelectItem value="approved-pre-owned">APO 認證中古車</SelectItem>
                  <SelectItem value="accessories">原廠精品</SelectItem>
                  <SelectItem value="sv-custom">SV 訂製車</SelectItem>
                  <SelectItem value="genuine-accessories">原廠配件</SelectItem>
                  <SelectItem value="self-registration">自領牌</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 主要興趣車款 */}
            <div className="space-y-2">
              <Label>主要興趣車款</Label>
              <Select value={interestedModel} onValueChange={setInterestedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇車款" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Defender 90">Defender 90</SelectItem>
                  <SelectItem value="Defender 110">Defender 110</SelectItem>
                  <SelectItem value="Defender 130">Defender 130</SelectItem>
                  <SelectItem value="Range Rover">Range Rover</SelectItem>
                  <SelectItem value="Range Rover Sport">Range Rover Sport</SelectItem>
                  <SelectItem value="Range Rover Velar">Range Rover Velar</SelectItem>
                  <SelectItem value="Range Rover Evoque">Range Rover Evoque</SelectItem>
                  <SelectItem value="Discovery">Discovery</SelectItem>
                  <SelectItem value="Discovery Sport">Discovery Sport</SelectItem>
                  <SelectItem value="F-PACE">F-PACE</SelectItem>
                  <SelectItem value="E-PACE">E-PACE</SelectItem>
                  <SelectItem value="I-PACE">I-PACE</SelectItem>
                  <SelectItem value="F-TYPE">F-TYPE</SelectItem>
                  <SelectItem value="XF">XF</SelectItem>
                  <SelectItem value="XE">XE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 動力型式 */}
            <div className="space-y-2">
              <Label>動力型式</Label>
              <Select value={powerType} onValueChange={setPowerType}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">汽油</SelectItem>
                  <SelectItem value="diesel">柴油</SelectItem>
                  <SelectItem value="electric">純電</SelectItem>
                  <SelectItem value="hybrid">混合動力</SelectItem>
                  <SelectItem value="mild-hybrid">高效輕油電</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 顧客想購買 SV / V8 車款 */}
            <div className="space-y-2">
              <Label>顧客想購買 SV / V8 車款</Label>
              <div className="mt-1">
                <Switch
                  checked={interestedSvV8}
                  onCheckedChange={setInterestedSvV8}
                />
              </div>
            </div>

            {/* Vista 訂單號碼 */}
            <div className="space-y-2">
              <Label>Vista 訂單號碼</Label>
              <Input
                value={vistaOrderNumber}
                onChange={(e) => setVistaOrderNumber(e.target.value)}
                placeholder="請輸入 Vista 訂單號碼"
              />
            </div>
          </Card>

          {/* 轉換資訊 */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-base">轉換資訊</h3>

            {/* 商機來源 */}
            <div className="space-y-2">
              <Label>商機來源</Label>
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇來源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">來店客 (Walk-in)</SelectItem>
                  <SelectItem value="referral">轉介 (Referral)</SelectItem>
                  <SelectItem value="retailer-experience">經銷商外展 / 體驗活動</SelectItem>
                  <SelectItem value="existing-customer">既有客戶</SelectItem>
                  <SelectItem value="phone-in">來電客</SelectItem>
                  <SelectItem value="line-booking">網路客預約 (LINE)</SelectItem>
                  <SelectItem value="field-visit">陌生開發</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 現有車輛品牌 */}
            <div className="space-y-2">
              <Label>現有車輛品牌</Label>
              <Input
                value={currentVehicleBrand}
                onChange={(e) => setCurrentVehicleBrand(e.target.value)}
                placeholder="請輸入現有車輛品牌"
              />
            </div>

            {/* 現有車輛 */}
            <div className="space-y-2">
              <Label>現有車輛</Label>
              <Input
                value={currentVehicle}
                onChange={(e) => setCurrentVehicle(e.target.value)}
                placeholder="請輸入現有車輛"
              />
            </div>
          </Card>

          {/* 描述 */}
          <Card className="p-4 space-y-4">
            <Label className="text-base font-semibold">描述</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="新增描述..."
              className="min-h-[120px]"
            />
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            建立機會
          </Button>
        </form>
      </main>
    </div>
  )
}

export default function NewOpportunityPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">載入中...</div>}>
      <NewOpportunityContent />
    </Suspense>
  )
}
