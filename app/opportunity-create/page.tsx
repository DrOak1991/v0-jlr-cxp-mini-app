"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getAccountById } from "@/lib/mock-data"

export default function NewOpportunityPage() {
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
  const [orderDate, setOrderDate] = useState<string>("")
  const [deliveryDate, setDeliveryDate] = useState<string>("")

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
                  <SelectItem value="prospecting">探索中</SelectItem>
                  <SelectItem value="qualification">資格確認</SelectItem>
                  <SelectItem value="needs-analysis">需求分析</SelectItem>
                  <SelectItem value="proposal">提案中</SelectItem>
                  <SelectItem value="negotiation">議價中</SelectItem>
                  <SelectItem value="closed-won">已成交</SelectItem>
                  <SelectItem value="closed-lost">已流失</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 訂單日期 */}
            <div className="space-y-2">
              <Label>訂單日期</Label>
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

            {/* 詳細分類 */}
            <div className="space-y-2">
              <Label>詳細分類</Label>
              <Select value={detailCategory} onValueChange={setDetailCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="fleet">Fleet</SelectItem>
                  <SelectItem value="approved-pre-owned">Approved Pre-Owned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 主要興趣車款 */}
            <div className="space-y-2">
              <Label>主要興趣車款</Label>
              <Input
                value={interestedModel}
                onChange={(e) => setInterestedModel(e.target.value)}
                placeholder="請輸入車款"
              />
            </div>

            {/* 動力型式 */}
            <div className="space-y-2">
              <Label>動力型式</Label>
              <Select value={powerType} onValueChange={setPowerType}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ice">燃油車</SelectItem>
                  <SelectItem value="phev">插電混合動力</SelectItem>
                  <SelectItem value="bev">純電動</SelectItem>
                </SelectContent>
              </Select>
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
