export interface Lead {
  id: string
  firstName: string
  lastName: string
  cxpName: string // Full name for display
  lineName?: string
  lineStatus: "joined" | "not-joined" // LINE 好友狀態
  avatarUrl?: string // LINE profile picture URL
  phone: string
  email: string
  createdAt: Date
  stage?: "new" | "follow-up" | "lost" | "converted"
  lostReason?: string // 流失原因（僅當 stage = lost 時有值）
  // Detail page fields
  birthday?: Date
  gender?: "male" | "female" | "unknown"
  idNumber?: string
  city?: string
  address?: string
  occupation?: string
  industry?: string
  workStatus?: string
  carType?: "new-car" | "certified-used"
  detailCategory?: "retail" | "fleet" | "approved-pre-owned"
  interestedModel?: "defender-90" | "defender-110" | "range-rover" | "range-rover-sport" | "discovery" | "i-pace"
  powerType?: "gasoline" | "diesel" | "electric" | "hybrid"
  performancePreference?: boolean
  leadSource?:
    | "walk-in"
    | "referral"
    | "retailer-experience"
    | "existing-customer"
    | "phone-in"
    | "line-booking"
    | "field-visit"
  referrer?: string
  interests?: string[]
  existingCarBrand?: string
  existingCarModel?: string
  contactPreferences?: ("mail" | "email" | "sms" | "phone")[]
  notes?: string
  testDriveConsent?: TestDriveConsent
}

export interface Opportunity {
  id: string
  accountId: string // 所屬帳戶 ID
  accountName: string // 所屬帳戶名稱（用於列表顯示）
  name: string // 機會名稱
  stage: "prospecting" | "qualification" | "needs-analysis" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  probability?: number // 可能性 %
  // 車型選擇
  carType?: "new-car" | "certified-used"
  detailCategory?: "retail" | "fleet" | "approved-pre-owned"
  interestedModel?: string
  powerType?: "gasoline" | "diesel" | "electric" | "hybrid"
  performancePreference?: boolean // SV/V8 偏好
  // 轉換資訊
  leadSource?: string
  existingCarBrand?: string
  existingCarModel?: string
  // 機會狀態
  orderDate?: Date // 訂單日期
  deliveryDate?: Date // 交車日期
  lostReason?: string // 流失原因（僅當 stage = closed-lost）
  // 活動記錄
  activities?: Activity[]
  createdAt: Date
  updatedAt?: Date
}

export interface Account {
  id: string
  firstName: string
  lastName: string
  cxpName: string // Full name for display
  lineName?: string
  lineStatus: "joined" | "not-joined" // LINE 好友狀態
  avatarUrl?: string // LINE profile picture URL
  phone: string
  email: string
  convertedAt: Date
  // Detail page fields
  birthday?: Date
  carType?: "new" | "certified-used"
  interestedModel?: "defender-90" | "defender-110" | "range-rover" | "range-rover-sport" | "discovery" | "i-pace"
  performancePreference?: boolean
  leadSource?:
    | "walk-in"
    | "referral"
    | "retailer-experience"
    | "existing-customer"
    | "phone-in"
    | "line-booking"
    | "field-visit"
  contactPreferences?: ("mail" | "email" | "sms" | "phone")[]
  notes?: string
}

export type TaskStatus = "not-started" | "in-progress" | "completed" | "waiting" | "deferred"

export interface EventActivity {
  id: string
  type: "event"
  subject: string
  description?: string
  startDateTime: Date
  endDateTime: Date
  createdAt: Date
}

export interface TaskActivity {
  id: string
  type: "task"
  subject: string
  description?: string
  dueDate: Date
  status: TaskStatus
  createdAt: Date
}

export type Activity = EventActivity | TaskActivity

export interface TestDriveConsent {
  id: string
  leadId: string
  status: "pending" | "completed" // pending = QR code generated, completed = customer confirmed
  generatedAt: Date // When QR code was generated
  submittedAt?: Date // When customer confirmed (only for completed status)
  qrCodeUrl?: string // QR code for pending status
  licensePhotoFront?: string // URL to front of license photo (only for completed)
  licensePhotoBack?: string // URL to back of license photo (only for completed)
  // Test drive details
  testDriveDate?: Date
  testDriveTime?: string // HH:MM format
  vehicleBrand?: string
  vehicleModel?: string
}
