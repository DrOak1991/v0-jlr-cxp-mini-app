"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selected, onChange, placeholder = "請選擇" }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((s) => s !== value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-transparent h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-accent text-accent-foreground rounded px-2 py-0.5 text-xs"
                >
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(item, e)}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                selected.includes(option) && "bg-accent/50"
              )}
            >
              <div className={cn(
                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                selected.includes(option) ? "bg-primary text-primary-foreground" : "opacity-50"
              )}>
                {selected.includes(option) && <Check className="h-3 w-3" />}
              </div>
              {option}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
