import { RefreshCw, Wifi } from "lucide-react"
import { Annotation, WireframeBox } from "./annotation"

export function LastUpdatedBar() {
  return (
    <Annotation label="Last Updated Indicator">
      <WireframeBox dashed className="flex items-center justify-between bg-card py-2.5 px-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">
            Data synced: Feb 14, 2026 at 10:32 AM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Wifi className="h-3 w-3" /> Live
          </span>
          <button className="flex items-center gap-1.5 border border-dashed border-border rounded px-2 py-1 hover:bg-muted/50 transition-colors cursor-pointer">
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">Refresh</span>
          </button>
        </div>
      </WireframeBox>
    </Annotation>
  )
}
