"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, User, Check, AlertTriangle } from "lucide-react"

// Mock contacts data - in real app this would come from API
const mockContacts = [
  { id: "c1", name: "王大明", phone: "0912-345-678", department: "台北營業部" },
  { id: "c2", name: "李小華", phone: "0923-456-789", department: "台中營業部" },
  { id: "c3", name: "陳志明", phone: "0934-567-890", department: "高雄營業部" },
  { id: "c4", name: "林美玲", phone: "0945-678-901", department: "台北營業部" },
  { id: "c5", name: "張文傑", phone: "0956-789-012", department: "新竹營業部" },
]

interface OwnerTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: "lead" | "opportunity" | "account"
  entityName: string
  currentOwner?: string
  onTransfer: (newOwnerId: string, newOwnerName: string) => void
}

export function OwnerTransferDialog({
  open,
  onOpenChange,
  entityType,
  entityName,
  currentOwner,
  onTransfer,
}: OwnerTransferDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null)
  const [step, setStep] = useState<"search" | "confirm">("search")

  const entityTypeLabel = {
    lead: "商機",
    opportunity: "機會",
    account: "帳戶",
  }[entityType]

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return mockContacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.replace(/-/g, "").includes(query.replace(/-/g, ""))
    )
  }, [searchQuery])

  const handleSelectContact = (contact: typeof mockContacts[0]) => {
    setSelectedContact(contact)
    setStep("confirm")
  }

  const handleConfirmTransfer = () => {
    if (selectedContact) {
      onTransfer(selectedContact.id, selectedContact.name)
      handleClose()
    }
  }

  const handleBack = () => {
    setStep("search")
  }

  const handleClose = () => {
    setSearchQuery("")
    setSelectedContact(null)
    setStep("search")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>擁有者變更</DialogTitle>
          <DialogDescription>
            將此{entityTypeLabel}「{entityName}」轉移給其他聯絡人
          </DialogDescription>
        </DialogHeader>

        {step === "search" && (
          <div className="space-y-4 py-4">
            {/* Current owner info */}
            {currentOwner && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">目前擁有者</p>
                <p className="font-medium">{currentOwner}</p>
              </div>
            )}

            {/* Search input */}
            <div className="space-y-2">
              <Label>搜尋新擁有者</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="輸入姓名或電話搜尋..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search results */}
            {searchQuery.trim() && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">搜尋結果</Label>
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">找不到符合的聯絡人</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          <p className="text-xs text-muted-foreground">{contact.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searchQuery.trim() && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">請輸入姓名或電話搜尋聯絡人</p>
              </div>
            )}
          </div>
        )}

        {step === "confirm" && selectedContact && (
          <div className="space-y-4 py-4">
            {/* Warning message */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">請確認轉移操作</p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  轉移後，此{entityTypeLabel}將由新擁有者管理，您將無法再編輯此資料。
                </p>
              </div>
            </div>

            {/* Transfer details */}
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">{entityTypeLabel}名稱</p>
                <p className="font-medium">{entityName}</p>
              </div>

              {currentOwner && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-1">目前擁有者</p>
                  <p className="font-medium">{currentOwner}</p>
                </div>
              )}

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">新擁有者</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedContact.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "search" ? (
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                返回
              </Button>
              <Button onClick={handleConfirmTransfer}>
                <Check className="h-4 w-4 mr-2" />
                確認轉移
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
