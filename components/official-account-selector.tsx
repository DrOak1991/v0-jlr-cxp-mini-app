"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 模擬的官方帳號列表 - 實際應從 API 或設定取得
const officialAccounts = [
  { id: "oa-1", name: "九和台北 Land Rover", brand: "Land Rover" },
  { id: "oa-2", name: "九和台北 Jaguar", brand: "Jaguar" },
]

interface OfficialAccountSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function OfficialAccountSelector({
  value,
  onChange,
  label = "選擇官方帳號",
}: OfficialAccountSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="請選擇官方帳號" />
        </SelectTrigger>
        <SelectContent>
          {officialAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        邀請連結將連接到所選的 LINE 官方帳號
      </p>
    </div>
  )
}

export { officialAccounts }
