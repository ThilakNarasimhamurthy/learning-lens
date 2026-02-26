import { Search, Bell, ChevronDown, LayoutDashboard } from "lucide-react"
import { Annotation, WireframeBox, Placeholder } from "./annotation"

export function DashboardHeader() {
  return (
    <Annotation label="Top Nav Bar">
      <WireframeBox className="flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-foreground" />
          <span className="font-mono text-sm font-bold tracking-wide text-foreground">
            Teacher Dashboard
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 border border-dashed border-border rounded px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">Search students, classes...</span>
          <Placeholder height="h-4" className="w-16" />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
          </div>
          <div className="flex items-center gap-2 border border-dashed border-border rounded px-2 py-1">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <span className="text-xs font-mono text-foreground hidden sm:inline">Ms. Johnson</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </WireframeBox>
    </Annotation>
  )
}
