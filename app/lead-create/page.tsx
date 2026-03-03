"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Car, Upload, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/hooks/use-toast"
import { MultiSelect } from "@/components/multi-select"

export default function NewLeadPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Page step state: "lead-form" | "test-drive-form" | "test-drive-qrcode"
  const [pageStep, setPageStep] = useState<"lead-form" | "test-drive-form" | "test-drive-qrcode">("lead-form")

  // Form state
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [notes, setNotes] = useState("")
  const [stage, setStage] = useState<string>("new")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [birthday, setBirthday] = useState<Date>()
  const [gender, setGender] = useState<string>("")
  const [idNumber, setIdNumber] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [occupation, setOccupation] = useState("")
  const [industry, setIndustry] = useState("")
  const [workStatus, setWorkStatus] = useState("")
  const [carType, setCarType] = useState<string>("")
  const [detailCategory, setDetailCategory] = useState<string>("")
  const [interestedModel, setInterestedModel] = useState<string>("")
  const [powerType, setPowerType] = useState<string>("")
  const [performancePreference, setPerformancePreference] = useState(false)
  const [leadSource, setLeadSource] = useState<string>("")
  const [referrer, setReferrer] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [existingCarBrand, setExistingCarBrand] = useState<string>("")
  const [existingCarModel, setExistingCarModel] = useState<string>("")
  const [contactPreferences, setContactPreferences] = useState<string[]>(["mail", "email", "sms", "phone"])

  // Mock dropdown options
  const cityOptions = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣",
    "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "台東縣", "澎湖縣", "金門縣", "連江縣"
  ]
  const occupationOptions = ["企業主", "高階主管", "中階主管", "專業人士", "自由業", "軍公教", "退休人員", "學生", "其他"]
  const industryOptions = ["科技業", "金融業", "製造業", "服務業", "醫療業", "營建業", "貿易業", "農林漁牧", "政府機關", "教育業", "其他"]
  const workStatusOptions = ["全職", "兼職", "自營", "退休", "待業", "學生"]
  const interestOptions = ["高爾夫", "旅遊", "攝影", "品酒", "科技", "戶外運動", "藝術", "音樂", "閱讀", "健身"]
  const existingCarBrandOptions: Record<string, string[]> = {
    "BMW": ["X1", "X3", "X5", "X7", "3 Series", "5 Series", "7 Series"],
    "Mercedes-Benz": ["GLA", "GLC", "GLE", "GLS", "C-Class", "E-Class", "S-Class"],
    "Audi": ["Q3", "Q5", "Q7", "Q8", "A4", "A6", "A8"],
    "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60"],
    "Porsche": ["Cayenne", "Macan", "Taycan", "911", "Panamera"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
    "Toyota": ["RAV4", "Camry", "Corolla Cross", "Land Cruiser"],
    "Lexus": ["RX", "NX", "UX", "ES", "LS", "LX"],
  }

  // Test drive form state
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

  // Normalize phone: strip leading 0, dashes, spaces
  const normalizePhone = (input: string) => {
    const cleaned = input.replace(/[-\s]/g, "")
    return cleaned.startsWith("0") ? cleaned.substring(1) : cleaned
  }

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!lastName.trim()) newErrors.lastName = "請輸入姓氏"
    if (!firstName.trim()) newErrors.firstName = "請輸入名字"
    if (notes.length > 500) newErrors.notes = "描述不可超過 500 字"
    if (!stage) newErrors.stage = "請選擇商機狀態"
    if (!phone.trim()) newErrors.phone = "請輸入行動電話"
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "電子郵件格式不正確"
    if (!carType) newErrors.carType = "請選擇購車方式"
    if (!leadSource) newErrors.leadSource = "請選擇商機來源"
    if (leadSource === "referral" && !referrer.trim()) newErrors.referrer = "請輸入轉介者"
    if (contactPreferences.length === 0) newErrors.contactPreferences = "請至少選擇一個聯絡管道"

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

    // In real app, submit to API
    console.log("[v0] Submitting new lead:", {
      lastName,
      firstName,
      notes,
      stage,
      phone,
      email,
      birthday,
      carType,
      interestedModel,
      performancePreference,
      leadSource,
      contactPreferences,
    })

    toast({
      title: "新增成功",
      description: "商機已成功建立",
    })

    router.push("/")
  }

  const handleContactPreferenceChange = (value: string, checked: boolean) => {
    if (checked) {
      setContactPreferences([...contactPreferences, value])
    } else {
      setContactPreferences(contactPreferences.filter((v) => v !== value))
    }
  }

  const handleContinueToTestDrive = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "表單驗證失敗",
        description: "請檢查必填欄位",
        variant: "destructive",
      })
      return
    }

    setPageStep("test-drive-form")
  }

  const handleCreateTestDriveQR = () => {
    if (!testDriveDate || !testDriveTime || !testDriveBrand || !testDriveModel) {
      toast({
        title: "請填寫完整資料",
        description: "試駕日期、時間、車輛品牌與型號為必填",
        variant: "destructive",
      })
      return
    }
    setPageStep("test-drive-qrcode")
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

  const handleFinish = () => {
    toast({
      title: "建立成功",
      description: "商機與試駕同意書已成功建立",
    })
    router.push("/")
  }

  const handleBackToTestDriveForm = () => {
    setPageStep("test-drive-form")
  }

  // Get page title based on current step
  const getPageTitle = () => {
    switch (pageStep) {
      case "lead-form":
        return "新增商機"
      case "test-drive-form":
        return "建立試駕同意書"
      case "test-drive-qrcode":
        return "試駕邀請 QR Code"
      default:
        return "新增商機"
    }
  }

  const handleBack = () => {
    if (pageStep === "lead-form") {
      router.back()
    } else if (pageStep === "test-drive-form") {
      setPageStep("lead-form")
    } else if (pageStep === "test-drive-qrcode") {
      setPageStep("test-drive-form")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Lead Form */}
      {pageStep === "lead-form" && (
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 姓氏 */}
        <div className="space-y-2">
          <Label htmlFor="lastName">姓氏 <span className="text-destructive">*</span></Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="請輸入姓氏" />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>

        {/* 名字 */}
        <div className="space-y-2">
          <Label htmlFor="firstName">名字 <span className="text-destructive">*</span></Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="請輸入名字" />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="notes">描述</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="輸入描述..." rows={4} maxLength={500} />
          <div className="flex justify-between items-center">
            <div>{errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}</div>
            <p className="text-sm text-muted-foreground">{notes.length} / 500</p>
          </div>
        </div>

        {/* 商機狀態 */}
        <div className="space-y-2">
          <Label htmlFor="stage">商機狀態 <span className="text-destructive">*</span></Label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger id="stage"><SelectValue placeholder="請選擇商機狀態" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="follow-up">Follow up</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
          {errors.stage && <p className="text-sm text-destructive">{errors.stage}</p>}
        </div>

        {/* 行動電話 */}
        <div className="space-y-2">
          <Label htmlFor="phone">行動電話 <span className="text-destructive">*</span></Label>
          <div className="flex">
            <div className="flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-sm text-muted-foreground select-none">
              886
            </div>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
              placeholder="912345678"
              className="rounded-l-none"
            />
          </div>
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        {/* 電子郵件 */}
        <div className="space-y-2">
          <Label htmlFor="email">電子郵件</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* 生日 */}
        <div className="space-y-2">
          <Label>生日</Label>
          <DatePicker date={birthday} onDateChange={setBirthday} placeholder="選擇生日" />
        </div>

        {/* 性別 */}
        <div className="space-y-2">
          <Label htmlFor="gender">性別</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender"><SelectValue placeholder="請選擇性別" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">男</SelectItem>
              <SelectItem value="female">女</SelectItem>
              <SelectItem value="unknown">不清楚</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 身分證字號 */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">身分證字號</Label>
          <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="請輸入身分證字號" />
        </div>

        {/* 地址 */}
        <div className="space-y-3">
          <Label>地址</Label>
          <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm text-muted-foreground">縣市</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger id="city"><SelectValue placeholder="請選擇縣市" /></SelectTrigger>
                <SelectContent>
                  {cityOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm text-muted-foreground">地址</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="請輸入地址" />
            </div>
          </div>
        </div>

        {/* 職業 */}
        <div className="space-y-2">
          <Label htmlFor="occupation">職業</Label>
          <Select value={occupation} onValueChange={setOccupation}>
            <SelectTrigger id="occupation"><SelectValue placeholder="請選擇職業" /></SelectTrigger>
            <SelectContent>
              {occupationOptions.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 行業 */}
        <div className="space-y-2">
          <Label htmlFor="industry">行業</Label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger id="industry"><SelectValue placeholder="請選擇行業" /></SelectTrigger>
            <SelectContent>
              {industryOptions.map((i) => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 工作狀態 */}
        <div className="space-y-2">
          <Label htmlFor="workStatus">工作狀態</Label>
          <Select value={workStatus} onValueChange={setWorkStatus}>
            <SelectTrigger id="workStatus"><SelectValue placeholder="請選擇工作狀態" /></SelectTrigger>
            <SelectContent>
              {workStatusOptions.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 購車方式 */}
        <div className="space-y-3">
          <Label>購車方式 <span className="text-destructive">*</span></Label>
          <RadioGroup value={carType} onValueChange={setCarType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new-car" id="new-car" />
              <Label htmlFor="new-car" className="font-normal">新車</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="certified-used" id="certified-used" />
              <Label htmlFor="certified-used" className="font-normal">認證中古車</Label>
            </div>
          </RadioGroup>
          {errors.carType && <p className="text-sm text-destructive">{errors.carType}</p>}
        </div>

        {/* 詳細分類 */}
        <div className="space-y-2">
          <Label htmlFor="detailCategory">詳細分類</Label>
          <Select value={detailCategory} onValueChange={setDetailCategory}>
            <SelectTrigger id="detailCategory"><SelectValue placeholder="請選擇詳細分類" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="fleet">Fleet</SelectItem>
              <SelectItem value="approved-pre-owned">Approved Pre-Owned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 主要興趣車款 */}
        <div className="space-y-2">
          <Label htmlFor="interestedModel">主要興趣車款</Label>
          <Select value={interestedModel} onValueChange={setInterestedModel}>
            <SelectTrigger id="interestedModel"><SelectValue placeholder="請選擇車款" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="defender-90">Defender 90</SelectItem>
              <SelectItem value="defender-110">Defender 110</SelectItem>
              <SelectItem value="range-rover">Range Rover</SelectItem>
              <SelectItem value="range-rover-sport">Range Rover Sport</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="i-pace">I-PACE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 動力型式 */}
        <div className="space-y-2">
          <Label htmlFor="powerType">動力型式</Label>
          <Select value={powerType} onValueChange={setPowerType}>
            <SelectTrigger id="powerType"><SelectValue placeholder="請選擇動力型式" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">汽油</SelectItem>
              <SelectItem value="diesel">柴油</SelectItem>
              <SelectItem value="electric">純電</SelectItem>
              <SelectItem value="hybrid">混合動力</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 顧客想購買 SV / V8 車款 */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="performancePreference"
            checked={performancePreference}
            onCheckedChange={(checked) => setPerformancePreference(checked as boolean)}
          />
          <Label htmlFor="performancePreference" className="font-normal">顧客想購買 SV / V8 車款</Label>
        </div>

        {/* 商機來源 */}
        <div className="space-y-3">
          <Label>商機來源 <span className="text-destructive">*</span></Label>
          <Select value={leadSource} onValueChange={(value) => { setLeadSource(value); if (value !== "referral") setReferrer("") }}>
            <SelectTrigger><SelectValue placeholder="請選擇商機來源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">來店客 (Walk-in)</SelectItem>
              <SelectItem value="referral">轉介 (Referral)</SelectItem>
              <SelectItem value="retailer-experience">經銷商外展 / 體驗活動 (Retailer Experience)</SelectItem>
              <SelectItem value="existing-customer">既有客戶 (Existing Customer)</SelectItem>
              <SelectItem value="phone-in">來電客 (Phone-in)</SelectItem>
              <SelectItem value="line-booking">網路客預約 (LINE)</SelectItem>
              <SelectItem value="field-visit">陌生開發 (Field Visit)</SelectItem>
            </SelectContent>
          </Select>
          {leadSource === "referral" && (
            <div className="space-y-2 mt-3">
              <Label htmlFor="referrer">轉介者 <span className="text-destructive">*</span></Label>
              <Input id="referrer" value={referrer} onChange={(e) => setReferrer(e.target.value)} placeholder="請輸入轉介者姓名" />
              {errors.referrer && <p className="text-sm text-destructive">{errors.referrer}</p>}
            </div>
          )}
          {errors.leadSource && <p className="text-sm text-destructive">{errors.leadSource}</p>}
        </div>

        {/* 興趣 */}
        <div className="space-y-2">
          <Label>興趣</Label>
          <MultiSelect
            options={interestOptions}
            selected={interests}
            onChange={setInterests}
            placeholder="請選擇興趣（可多選）"
          />
        </div>

        {/* 現有車輛品牌 */}
        <div className="space-y-2">
          <Label htmlFor="existingCarBrand">現有車輛品牌</Label>
          <Select value={existingCarBrand} onValueChange={(value) => { setExistingCarBrand(value); setExistingCarModel("") }}>
            <SelectTrigger id="existingCarBrand"><SelectValue placeholder="請選擇品牌" /></SelectTrigger>
            <SelectContent>
              {Object.keys(existingCarBrandOptions).map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 現有車輛 */}
        <div className="space-y-2">
          <Label htmlFor="existingCarModel">現有車輛</Label>
          <Select value={existingCarModel} onValueChange={setExistingCarModel} disabled={!existingCarBrand}>
            <SelectTrigger id="existingCarModel"><SelectValue placeholder={existingCarBrand ? "請選擇車款" : "請先選擇品牌"} /></SelectTrigger>
            <SelectContent>
              {existingCarBrand && existingCarBrandOptions[existingCarBrand]?.map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 客戶願意接受 JLR 與經銷商聯絡的管道 */}
        <div className="space-y-3">
          <Label>客戶願意接受 JLR 與經銷商聯絡的管道 <span className="text-destructive">*</span></Label>
          <p className="text-sm text-muted-foreground">若客戶沒有特別說明，建議請全選，以讓我們跟客戶的聯絡可以暢行無阻。</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="mail" checked={contactPreferences.includes("mail")} onCheckedChange={(checked) => handleContactPreferenceChange("mail", checked as boolean)} />
              <Label htmlFor="mail" className="font-normal">郵寄</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email-contact" checked={contactPreferences.includes("email")} onCheckedChange={(checked) => handleContactPreferenceChange("email", checked as boolean)} />
              <Label htmlFor="email-contact" className="font-normal">電子郵件</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sms" checked={contactPreferences.includes("sms")} onCheckedChange={(checked) => handleContactPreferenceChange("sms", checked as boolean)} />
              <Label htmlFor="sms" className="font-normal">簡訊</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="phone-contact" checked={contactPreferences.includes("phone")} onCheckedChange={(checked) => handleContactPreferenceChange("phone", checked as boolean)} />
              <Label htmlFor="phone-contact" className="font-normal">電話</Label>
            </div>
          </div>
          {errors.contactPreferences && <p className="text-sm text-destructive">{errors.contactPreferences}</p>}
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 space-y-3">
          <Button type="button" className="w-full" size="lg" onClick={handleContinueToTestDrive}>
            <Car className="h-4 w-4 mr-2" />
            繼續建立試駕同意書
          </Button>
          <Button type="submit" variant="outline" className="w-full" size="lg">
            建立商機
          </Button>
        </div>
      </form>
      )}

      {/* Test Drive Form */}
      {pageStep === "test-drive-form" && (
        <div className="p-4 space-y-6">
          {/* Test Drive Date */}
          <div className="space-y-2">
            <Label>試駕日期 <span className="text-destructive">*</span></Label>
            <Input
              type="date"
              value={testDriveDate}
              onChange={(e) => setTestDriveDate(e.target.value)}
            />
          </div>

          {/* Test Drive Time */}
          <div className="space-y-2">
            <Label>試駕時間 <span className="text-destructive">*</span></Label>
            <Input
              type="time"
              value={testDriveTime}
              onChange={(e) => setTestDriveTime(e.target.value)}
            />
          </div>

          {/* Vehicle Brand */}
          <div className="space-y-2">
            <Label>試駕車輛品牌 <span className="text-destructive">*</span></Label>
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
            <Label>試駕車輛型號 <span className="text-destructive">*</span></Label>
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
                  <img src={licenseFrontPreview} alt="駕照正面" className="max-h-32 mx-auto rounded" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
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
                  <img src={licenseBackPreview} alt="駕照背面" className="max-h-32 mx-auto rounded" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
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
          <div className="pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateTestDriveQR}
              disabled={!testDriveDate || !testDriveTime || !testDriveBrand || !testDriveModel}
            >
              <Car className="h-4 w-4 mr-2" />
              建立邀請 QR Code
            </Button>
          </div>
        </div>
      )}

      {/* Test Drive QR Code Display */}
      {pageStep === "test-drive-qrcode" && (
        <div className="p-4 space-y-6">
          {/* QR Code display */}
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm font-medium text-muted-foreground">客戶邀請 QR Code</p>
            <div className="bg-white p-4 rounded-lg border w-[60%] aspect-square flex items-center justify-center">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>

          {/* Test drive info */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">賞車客戶名稱</span>
              <span className="text-sm font-medium">{lastName}{firstName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">試駕車款</span>
              <span className="text-sm font-medium">{testDriveBrand} {testDriveModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">試駕時間</span>
              <span className="text-sm font-medium">{testDriveDate} {testDriveTime}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 space-y-3">
            <Button className="w-full" size="lg" onClick={handleFinish}>
              完成
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={handleBackToTestDriveForm}>
              修改邀請資料
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
