"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, User, Building2, ChevronRight } from "lucide-react"
import type { Lead, Account, Opportunity } from "@/types"
import { mockAccounts } from "@/lib/mock-data"

// Vehicle model display names
const vehicleModelNames: Record<string, string> = {
  "defender-90": "Defender 90",
  "defender-110": "Defender 110",
  "range-rover": "Range Rover",
  "range-rover-sport": "Range Rover Sport",
  "discovery": "Discovery",
  "i-pace": "I-PACE",
}

interface LeadConversionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead
  onConvert: (data: {
    accountMode: "new" | "existing"
    accountId?: string
    newAccountFirstName?: string
    newAccountLastName?: string
    updateLeadSource: boolean
    opportunityMode: "new" | "existing"
    opportunityId?: string
    newOpportunityName?: string
  }) => void
  onCancel: () => void
}

export function LeadConversionDialog({
  open,
  onOpenChange,
  lead,
  onConvert,
  onCancel,
}: LeadConversionDialogProps) {
  const router = useRouter()

  // Account selection state
  const [accountMode, setAccountMode] = useState<"new" | "existing">("new")
  const [newAccountFirstName, setNewAccountFirstName] = useState(lead.firstName || "")
  const [newAccountLastName, setNewAccountLastName] = useState(lead.lastName || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [updateLeadSource, setUpdateLeadSource] = useState(false)

  // Opportunity selection state
  const [newOpportunityName, setNewOpportunityName] = useState("")

  // Get model display name
  const modelDisplayName = lead.interestedModel ? vehicleModelNames[lead.interestedModel] || lead.interestedModel : ""

  // Initialize opportunity name with format [{lastName}{firstName} - {model}]
  useEffect(() => {
    if (accountMode === "new") {
      const name = `${newAccountLastName}${newAccountFirstName} - ${modelDisplayName}`.trim()
      setNewOpportunityName(name.endsWith(" - ") ? name.slice(0, -3) : name)
    } else if (selectedAccountId) {
      const account = mockAccounts.find(a => a.id === selectedAccountId)
      if (account) {
        const name = `${account.lastName}${account.firstName} - ${modelDisplayName}`.trim()
        setNewOpportunityName(name.endsWith(" - ") ? name.slice(0, -3) : name)
      }
    }
  }, [accountMode, newAccountFirstName, newAccountLastName, selectedAccountId, modelDisplayName])

  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      setAccountMode("new")
      setNewAccountFirstName(lead.firstName || "")
      setNewAccountLastName(lead.lastName || "")
      setSearchQuery("")
      setSelectedAccountId(null)
      setUpdateLeadSource(false)
      setNewOpportunityName("")
    }
  }, [open, lead])

  // When account mode changes to new, reset opportunity state
  useEffect(() => {
    // No need to reset opportunity mode anymore since we're always creating new
  }, [accountMode])

  // Filter accounts by search query (name or phone)
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return mockAccounts.slice(0, 10)
    const query = searchQuery.toLowerCase()
    return mockAccounts.filter(account => {
      const fullName = `${account.lastName}${account.firstName}`.toLowerCase()
      const phone = account.phone?.toLowerCase() || ""
      return fullName.includes(query) || phone.includes(query)
    }).slice(0, 10)
  }, [searchQuery])

  // Validation
  const isValid = useMemo(() => {
    // Account validation
    if (accountMode === "new") {
      if (!newAccountFirstName.trim() || !newAccountLastName.trim()) return false
    } else {
      if (!selectedAccountId) return false
    }

    // Opportunity validation - always creating new
    if (!newOpportunityName.trim()) return false

    return true
  }, [accountMode, newAccountFirstName, newAccountLastName, selectedAccountId, newOpportunityName])

  const handleConfirm = () => {
    if (!isValid) return

    onConvert({
      accountMode,
      accountId: accountMode === "existing" ? selectedAccountId! : undefined,
      newAccountFirstName: accountMode === "new" ? newAccountFirstName : undefined,
      newAccountLastName: accountMode === "new" ? newAccountLastName : undefined,
      updateLeadSource: accountMode === "existing" ? updateLeadSource : false,
      opportunityMode: "new",
      newOpportunityName: newOpportunityName,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>商機轉換</DialogTitle>
          <DialogDescription>將商機轉換為帳戶與機會</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Account Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">帳戶</h3>
            </div>

            <RadioGroup value={accountMode} onValueChange={(v) => setAccountMode(v as "new" | "existing")}>
              {/* New Account Option */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="account-new" />
                  <Label htmlFor="account-new" className="font-medium cursor-pointer">建立新帳戶</Label>
                </div>
                
                {accountMode === "new" && (
                  <div className="ml-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">姓氏</Label>
                        <Input
                          value={newAccountLastName}
                          onChange={(e) => setNewAccountLastName(e.target.value)}
                          placeholder="姓氏"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">名字</Label>
                        <Input
                          value={newAccountFirstName}
                          onChange={(e) => setNewAccountFirstName(e.target.value)}
                          placeholder="名字"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Account Option */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="account-existing" />
                  <Label htmlFor="account-existing" className="font-medium cursor-pointer">選擇既有帳戶</Label>
                </div>
                
                {accountMode === "existing" && (
                  <div className="ml-6 space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜尋姓名或電話..."
                        className="pl-9"
                      />
                    </div>

                    {/* Account List */}
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {filteredAccounts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">找不到符合的帳戶</p>
                      ) : (
                        filteredAccounts.map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            className={`w-full flex items-center justify-between p-3 text-left hover:bg-accent/50 transition-colors border-b last:border-b-0 ${
                              selectedAccountId === account.id ? "bg-accent" : ""
                            }`}
                            onClick={() => setSelectedAccountId(account.id)}
                          >
                            <div>
                              <p className="font-medium text-sm">{account.lastName}{account.firstName}</p>
                              <p className="text-xs text-muted-foreground">{account.phone}</p>
                            </div>
                            {selectedAccountId === account.id && (
                              <ChevronRight className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Update Lead Source Checkbox */}
                    {selectedAccountId && (
                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                          id="updateLeadSource"
                          checked={updateLeadSource}
                          onCheckedChange={(checked) => setUpdateLeadSource(checked === true)}
                        />
                        <Label htmlFor="updateLeadSource" className="text-sm cursor-pointer">
                          更新商機來源到此帳戶
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Opportunity Section */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">機會</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                若買車人（車主）與用車人（駕駛）為不同人，則帳戶姓名與資料請以用車人（駕駛）為主；機會名稱則輸入買車人姓名。
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">機會名稱</Label>
              <Input
                value={newOpportunityName}
                onChange={(e) => setNewOpportunityName(e.target.value)}
                placeholder="機會名稱"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            確認轉換
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
