"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Car, User, Phone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAccountById, searchAccounts } from "@/lib/mock-data"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Account } from "@/types"

function NewOpportunityContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get accountId from URL params
  const accountId = searchParams.get("accountId")

  // Account data
  const [account, setAccount] = useState<Account | null>(null)

  useEffect(() => {
    if (accountId) {
      const accountData = getAccountById(accountId)
      if (accountData) {
        setAccount(accountData)
      }
    }
  }, [accountId])

  // Form state
  const [opportunityName, setOpportunityName] = useState("")
  const [notes, setNotes] = useState("")
  const [stage, setStage] = useState<string>("contact")
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
  const [referrer, setReferrer] = useState("")
  const [isReferrerSheetOpen, setIsReferrerSheetOpen] = useState(false)
  const [referrerSearch, setReferrerSearch] = useState("")
  const [interestedSvV8, setInterestedSvV8] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!opportunityName.trim()) newErrors.opportunityName = "請輸入機會名稱"
    if (!carType) newErrors.carType = "請選擇購車方式"
    if (!interestedModel) newErrors.interestedModel = "請選擇主要興趣車款"
    if (!leadSource) newErrors.leadSource = "請選擇商機來源"
    if (!orderDate) newErrors.orderDate = "請選擇訂購日期"

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
      description: `已成功建立機會：${opportunityName}`,
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

      {/* 帳戶資訊區塊 */}
      {account && (
        <div className="bg-muted/50 border-b px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2">為以下帳戶新增機會</p>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{account.cxpName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{account.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本資訊 */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-base">基本資訊</h3>

            {/* 機會名稱 */}
            <div className="space-y-2">
              <Label>
                機會名稱 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={opportunityName}
                onChange={(e) => setOpportunityName(e.target.value)}
                placeholder="請輸入機會名稱"
                className={errors.opportunityName ? "border-red-500" : ""}
              />
              {errors.opportunityName && <p className="text-xs text-red-500">{errors.opportunityName}</p>}
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
              <Label>
                訂購日期 <span className="text-red-500">*</span>
              </Label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background ${errors.orderDate ? "border-red-500" : "border-input"}`}
              />
              {errors.orderDate && <p className="text-xs text-red-500">{errors.orderDate}</p>}
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
              <Label>購車方式 <span className="text-red-500">*</span></Label>
              <Select value={carType} onValueChange={setCarType}>
                <SelectTrigger className={errors.carType ? "border-red-500" : ""}>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-car">新車</SelectItem>
                  <SelectItem value="certified-used">認證中古車</SelectItem>
                </SelectContent>
              </Select>
              {errors.carType && <p className="text-xs text-red-500">{errors.carType}</p>}
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
              <Label>主要興趣車款 <span className="text-red-500">*</span></Label>
              <Select value={interestedModel} onValueChange={setInterestedModel}>
                <SelectTrigger className={errors.interestedModel ? "border-red-500" : ""}>
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
              {errors.interestedModel && <p className="text-xs text-red-500">{errors.interestedModel}</p>}
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

            {/* 顧客想購買 SV / OCTA / V8 車款 */}
            <div className="space-y-2">
              <Label>顧客想購買 SV / OCTA / V8 車款</Label>
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
              <Label>商機來源 <span className="text-red-500">*</span></Label>
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger className={errors.leadSource ? "border-red-500" : ""}>
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
              {errors.leadSource && <p className="text-xs text-red-500">{errors.leadSource}</p>}
              {/* 轉介者欄位 - 當選擇 referral 時顯示 */}
              {leadSource === "referral" && (
                <div className="space-y-2 mt-3">
                  <Label>轉介者</Label>
                  <button
                    type="button"
                    onClick={() => setIsReferrerSheetOpen(true)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-left hover:bg-accent transition-colors flex items-center justify-between"
                  >
                    <span className={referrer ? "text-foreground" : "text-muted-foreground"}>
                      {referrer || "點擊搜尋轉介者"}
                    </span>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )}
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

      {/* 轉介者搜尋 Sheet */}
      <Sheet open={isReferrerSheetOpen} onOpenChange={setIsReferrerSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>搜尋轉介者</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <Input
              placeholder="輸入姓名或電話搜尋..."
              value={referrerSearch}
              onChange={(e) => setReferrerSearch(e.target.value)}
              autoFocus
            />

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pb-4">
              {searchAccounts(referrerSearch).map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setReferrer(acc.cxpName)
                    setIsReferrerSheetOpen(false)
                    setReferrerSearch("")
                  }}
                  className="w-full p-3 border border-input rounded-lg hover:bg-accent hover:border-primary transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{acc.cxpName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{acc.phone || acc.mobilePhone || "無電話"}</span>
                    </div>
                  </div>
                </button>
              ))}
              {searchAccounts(referrerSearch).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">找不到符合的帳戶</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
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
