/**
 * 欄位定義集中管理
 * 這個檔案包含所有實體（商機、機會、帳戶）的欄位選項定義
 * 每個欄位都標註了所屬的實體類型
 */

// ============================================
// 實體類型定義
// ============================================
export type EntityType = "lead" | "opportunity" | "account"

export interface FieldOption {
  key: string
  label: string
  entities: EntityType[] // 此選項適用的實體
}

export interface FieldDefinition {
  fieldKey: string
  fieldLabel: string
  entities: EntityType[] // 此欄位適用的實體
  options: FieldOption[]
}

// ============================================
// 商機 (Lead) 狀態
// ============================================
export const leadStageOptions: FieldOption[] = [
  { key: "new", label: "新增（尚未聯繫）", entities: ["lead"] },
  { key: "follow-up", label: "已聯繫並持續跟進", entities: ["lead"] },
  { key: "qualified", label: "合格", entities: ["lead"] },
  { key: "lost", label: "戰敗", entities: ["lead"] },
]

export const leadStageDefinition: FieldDefinition = {
  fieldKey: "stage",
  fieldLabel: "商機狀態",
  entities: ["lead"],
  options: leadStageOptions,
}

// ============================================
// 機會 (Opportunity) 狀態
// ============================================
export const opportunityStageOptions: FieldOption[] = [
  { key: "contact", label: "聯繫", entities: ["opportunity"] },
  { key: "test-drive", label: "試駕", entities: ["opportunity"] },
  { key: "vehicle-selection", label: "車型選擇", entities: ["opportunity"] },
  { key: "trade-in", label: "舊車處理", entities: ["opportunity"] },
  { key: "negotiation", label: "談判", entities: ["opportunity"] },
  { key: "order", label: "訂購", entities: ["opportunity"] },
  { key: "delivery", label: "交車", entities: ["opportunity"] },
  { key: "lost", label: "Lost", entities: ["opportunity"] },
]

export const opportunityStageDefinition: FieldDefinition = {
  fieldKey: "stage",
  fieldLabel: "機會階段",
  entities: ["opportunity"],
  options: opportunityStageOptions,
}

// ============================================
// 戰敗原因 (適用於商機和機會)
// ============================================
export const lostCategoryOptions: FieldOption[] = [
  { key: "competitor", label: "購買競牌", entities: ["lead", "opportunity"] },
  { key: "duplicate", label: "重複資料", entities: ["lead", "opportunity"] },
  { key: "no-interest", label: "沒有意願購買", entities: ["lead", "opportunity"] },
  { key: "unreachable", label: "無法聯繫", entities: ["lead", "opportunity"] },
]

export const lostCategoryDefinition: FieldDefinition = {
  fieldKey: "lostCategory",
  fieldLabel: "戰敗原因",
  entities: ["lead", "opportunity"],
  options: lostCategoryOptions,
}

// ============================================
// 性別 (適用於商機和帳戶)
// ============================================
export const genderOptions: FieldOption[] = [
  { key: "male", label: "男", entities: ["lead", "account"] },
  { key: "female", label: "女", entities: ["lead", "account"] },
  { key: "unknown", label: "不清楚", entities: ["lead", "account"] },
]

export const genderDefinition: FieldDefinition = {
  fieldKey: "gender",
  fieldLabel: "性別",
  entities: ["lead", "account"],
  options: genderOptions,
}

// ============================================
// 詳細分類 (適用於商機) / 次要形式 (適用於機會)
// ============================================
export const detailCategoryOptions: FieldOption[] = [
  { key: "retail", label: "零售", entities: ["lead", "opportunity"] },
  { key: "lease", label: "租賃", entities: ["lead", "opportunity"] },
  { key: "approved-pre-owned", label: "APO 認證中古車", entities: ["lead", "opportunity"] },
  { key: "service", label: "服務/維修", entities: ["lead"] }, // 僅商機
  { key: "accessories", label: "原廠精品", entities: ["lead", "opportunity"] },
  { key: "parts", label: "原廠零件", entities: ["lead"] }, // 僅商機
  { key: "sv-custom", label: "SV 訂製車", entities: ["lead", "opportunity"] },
  { key: "genuine-accessories", label: "原廠配件", entities: ["lead", "opportunity"] },
  { key: "evhc", label: "EVHC", entities: ["lead"] }, // 僅商機
  { key: "self-registration", label: "自領牌", entities: ["lead", "opportunity"] },
]

export const detailCategoryDefinition: FieldDefinition = {
  fieldKey: "detailCategory",
  fieldLabel: "詳細分類", // 商機用「詳細分類」，機會用「次要形式」
  entities: ["lead", "opportunity"],
  options: detailCategoryOptions,
}

// ============================================
// 客戶最感興趣的車型 (適用於商機和機會)
// ============================================
export const interestedModelOptions: FieldOption[] = [
  { key: "range-rover", label: "Range Rover", entities: ["lead", "opportunity"] },
  { key: "range-rover-sport", label: "Range Rover Sport", entities: ["lead", "opportunity"] },
  { key: "range-rover-velar", label: "Range Rover Velar", entities: ["lead", "opportunity"] },
  { key: "range-rover-evoque", label: "Range Rover Evoque", entities: ["lead", "opportunity"] },
  { key: "defender-130", label: "Defender 130", entities: ["lead", "opportunity"] },
  { key: "defender-110", label: "Defender 110", entities: ["lead", "opportunity"] },
  { key: "defender-90", label: "Defender 90", entities: ["lead", "opportunity"] },
  { key: "discovery", label: "Discovery", entities: ["lead", "opportunity"] },
  { key: "discovery-sport", label: "Discovery Sport", entities: ["lead", "opportunity"] },
  { key: "f-type", label: "F-TYPE", entities: ["lead", "opportunity"] },
  { key: "f-pace", label: "F-PACE", entities: ["lead", "opportunity"] },
  { key: "e-pace", label: "E-PACE", entities: ["lead", "opportunity"] },
  { key: "i-pace", label: "I-PACE", entities: ["lead", "opportunity"] },
]

export const interestedModelDefinition: FieldDefinition = {
  fieldKey: "interestedModel",
  fieldLabel: "客戶最感興趣的車型",
  entities: ["lead", "opportunity"],
  options: interestedModelOptions,
}

// ============================================
// 動力型式 (適用於商機和機會)
// ============================================
export const powerTypeOptions: FieldOption[] = [
  { key: "gasoline", label: "汽油", entities: ["lead", "opportunity"] },
  { key: "diesel", label: "柴油", entities: ["lead", "opportunity"] },
  { key: "electric", label: "純電", entities: ["lead", "opportunity"] },
  { key: "hybrid", label: "混合動力", entities: ["lead", "opportunity"] },
  { key: "mild-hybrid", label: "高效輕油電", entities: ["lead", "opportunity"] },
]

export const powerTypeDefinition: FieldDefinition = {
  fieldKey: "powerType",
  fieldLabel: "動力型式",
  entities: ["lead", "opportunity"],
  options: powerTypeOptions,
}

// ============================================
// 商機來源 (適用於商機)
// ============================================
export const leadSourceOptions: FieldOption[] = [
  { key: "walk-in", label: "Walk In", entities: ["lead"] },
  { key: "phone-in", label: "Phone In", entities: ["lead"] },
  { key: "referral", label: "Referral", entities: ["lead"] },
  { key: "website", label: "Website", entities: ["lead"] },
  { key: "social-media", label: "Social Media", entities: ["lead"] },
  { key: "event", label: "Event", entities: ["lead"] },
  { key: "advertisement", label: "Advertisement", entities: ["lead"] },
  { key: "repeat-customer", label: "Repeat Customer", entities: ["lead"] },
  { key: "corporate-sales", label: "Corporate Sales", entities: ["lead"] },
  { key: "other", label: "Other", entities: ["lead"] },
]

export const leadSourceDefinition: FieldDefinition = {
  fieldKey: "source",
  fieldLabel: "商機來源",
  entities: ["lead"],
  options: leadSourceOptions,
}

// ============================================
// 職業 (適用於商機和帳戶)
// ============================================
export const occupationOptions: FieldOption[] = [
  { key: "business-owner", label: "企業主", entities: ["lead", "account"] },
  { key: "self-employed", label: "自營業者", entities: ["lead", "account"] },
  { key: "executive", label: "高階主管", entities: ["lead", "account"] },
  { key: "professional", label: "專業人士", entities: ["lead", "account"] },
  { key: "office-worker", label: "一般職員", entities: ["lead", "account"] },
  { key: "government", label: "公務人員", entities: ["lead", "account"] },
  { key: "teacher", label: "教師", entities: ["lead", "account"] },
  { key: "military", label: "軍人", entities: ["lead", "account"] },
  { key: "police", label: "警察", entities: ["lead", "account"] },
  { key: "medical", label: "醫療人員", entities: ["lead", "account"] },
  { key: "freelancer", label: "自由業", entities: ["lead", "account"] },
  { key: "retired", label: "退休", entities: ["lead", "account"] },
  { key: "student", label: "學生", entities: ["lead", "account"] },
  { key: "homemaker", label: "家管", entities: ["lead", "account"] },
  { key: "other", label: "其他", entities: ["lead", "account"] },
]

export const occupationDefinition: FieldDefinition = {
  fieldKey: "occupation",
  fieldLabel: "職業",
  entities: ["lead", "account"],
  options: occupationOptions,
}

// ============================================
// 行業 (適用於商機和帳戶)
// ============================================
export const industryOptions: FieldOption[] = [
  { key: "tech", label: "科技業", entities: ["lead", "account"] },
  { key: "finance", label: "金融業", entities: ["lead", "account"] },
  { key: "manufacturing", label: "製造業", entities: ["lead", "account"] },
  { key: "retail", label: "零售業", entities: ["lead", "account"] },
  { key: "real-estate", label: "房地產業", entities: ["lead", "account"] },
  { key: "construction", label: "營造業", entities: ["lead", "account"] },
  { key: "healthcare", label: "醫療業", entities: ["lead", "account"] },
  { key: "education", label: "教育業", entities: ["lead", "account"] },
  { key: "hospitality", label: "餐飲旅遊業", entities: ["lead", "account"] },
  { key: "media", label: "媒體傳播業", entities: ["lead", "account"] },
  { key: "legal", label: "法律業", entities: ["lead", "account"] },
  { key: "consulting", label: "顧問業", entities: ["lead", "account"] },
  { key: "transportation", label: "運輸物流業", entities: ["lead", "account"] },
  { key: "agriculture", label: "農林漁牧業", entities: ["lead", "account"] },
  { key: "government", label: "政府機關", entities: ["lead", "account"] },
  { key: "other", label: "其他", entities: ["lead", "account"] },
]

export const industryDefinition: FieldDefinition = {
  fieldKey: "industry",
  fieldLabel: "行業",
  entities: ["lead", "account"],
  options: industryOptions,
}

// ============================================
// 工作狀態 (適用於商機和帳戶)
// ============================================
export const employmentStatusOptions: FieldOption[] = [
  { key: "full-time", label: "全職", entities: ["lead", "account"] },
  { key: "part-time", label: "兼職", entities: ["lead", "account"] },
  { key: "self-employed", label: "自僱", entities: ["lead", "account"] },
  { key: "unemployed", label: "待業中", entities: ["lead", "account"] },
  { key: "retired", label: "退休", entities: ["lead", "account"] },
  { key: "student", label: "學生", entities: ["lead", "account"] },
]

export const employmentStatusDefinition: FieldDefinition = {
  fieldKey: "employmentStatus",
  fieldLabel: "工作狀態",
  entities: ["lead", "account"],
  options: employmentStatusOptions,
}

// ============================================
// 輔助函數
// ============================================

/**
 * 取得欄位的標籤對照表
 */
export function getLabelsMap(options: FieldOption[]): Record<string, string> {
  return options.reduce(
    (acc, opt) => {
      acc[opt.key] = opt.label
      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * 依據實體類型過濾選項
 */
export function filterOptionsByEntity(options: FieldOption[], entity: EntityType): FieldOption[] {
  return options.filter((opt) => opt.entities.includes(entity))
}

/**
 * 取得選項的標籤
 */
export function getOptionLabel(options: FieldOption[], key: string): string {
  const option = options.find((opt) => opt.key === key)
  return option?.label ?? key
}

// ============================================
// 匯出所有欄位定義（方便查詢）
// ============================================
export const allFieldDefinitions: FieldDefinition[] = [
  leadStageDefinition,
  opportunityStageDefinition,
  lostCategoryDefinition,
  genderDefinition,
  detailCategoryDefinition,
  interestedModelDefinition,
  powerTypeDefinition,
  leadSourceDefinition,
  occupationDefinition,
  industryDefinition,
  employmentStatusDefinition,
]

// ============================================
// 標籤對照表（方便 UI 使用）
// ============================================
export const leadStageLabels = getLabelsMap(leadStageOptions)
export const opportunityStageLabels = getLabelsMap(opportunityStageOptions)
export const lostCategoryLabels = getLabelsMap(lostCategoryOptions)
export const genderLabels = getLabelsMap(genderOptions)
export const detailCategoryLabels = getLabelsMap(detailCategoryOptions)
export const interestedModelLabels = getLabelsMap(interestedModelOptions)
export const powerTypeLabels = getLabelsMap(powerTypeOptions)
export const leadSourceLabels = getLabelsMap(leadSourceOptions)
export const occupationLabels = getLabelsMap(occupationOptions)
export const industryLabels = getLabelsMap(industryOptions)
export const employmentStatusLabels = getLabelsMap(employmentStatusOptions)
