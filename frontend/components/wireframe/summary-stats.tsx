import { Users, BookOpen, AlertTriangle, Clock } from "lucide-react"
import { Annotation, WireframeBox } from "./annotation"

const stats = [
  { icon: BookOpen, label: "Total Classes", value: "5", annotation: "Classes count" },
  { icon: Users, label: "Total Students", value: "127", annotation: "Student count" },
  { icon: AlertTriangle, label: "Need Support", value: "12", annotation: "Flagged by LLM" },
  { icon: Clock, label: "Last Updated", value: "2 min ago", annotation: "Sync indicator" },
]

export function SummaryStats() {
  return (
    <Annotation label="Summary Stats Row">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <WireframeBox key={stat.label} dashed className="bg-card flex items-center gap-3">
            <div className="h-9 w-9 rounded border border-dashed border-border flex items-center justify-center shrink-0">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-lg font-mono font-bold text-foreground leading-tight">{stat.value}</p>
            </div>
          </WireframeBox>
        ))}
      </div>
    </Annotation>
  )
}
