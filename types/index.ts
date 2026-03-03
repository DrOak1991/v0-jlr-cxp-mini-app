export interface Lead {
  id: string
  firstName: string
  lastName: string
  cxpName: string // Full name for display
  lineName: string
  lineStatus: "joined" | "not-joined" // LINE 好友狀態
  avatarUrl?: string // LINE profile picture URL
  phone: string
  email: string
  createdAt: Date
  stage?: "new" | "follow-up" | "lost" | "converted"
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

export interface Account {
  id: string
  firstName: string
  lastName: string
  cxpName: string // Full name for display
  lineName: string
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

export interface Activity {
  id: string
  type: "call" | "email" | "note" | "meeting" | "task" // Added "task" type for new activities
  content: string
  createdAt: Date
  name?: string
  dueDate?: Date
  notes?: string
  status?: "not-started" | "in-progress" | "completed"
}

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
