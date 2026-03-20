import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function OpportunityDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <Skeleton className="h-6 w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
        {/* Basic Info Card */}
        <Card className="p-4 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
          <div className="pt-3 border-t space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>

        {/* Car Selection Card */}
        <Card className="p-4 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Card */}
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
