import { AlertTriangle, Brain, ArrowRight } from "lucide-react"
import { Annotation, WireframeBox } from "./annotation"

const flaggedStudents = [
  { name: "Alex Rivera", class: "Algebra I", reason: "Declining scores over 3 weeks, missed 2 assignments", severity: "high" as const },
  { name: "Jordan Lee", class: "Biology 101", reason: "Engagement dropped 60%, struggles with lab concepts", severity: "high" as const },
  { name: "Sam Patel", class: "English Lit", reason: "Writing quality below baseline, possible comprehension gap", severity: "medium" as const },
  { name: "Casey Nguyen", class: "Algebra I", reason: "Frequent incorrect attempts, may need 1-on-1 support", severity: "medium" as const },
  { name: "Morgan Davis", class: "History", reason: "Attendance irregular, last 3 quizzes below passing", severity: "high" as const },
]

export function FlaggedPanel() {
  return (
    <Annotation label="Needs Support - LLM Flagged">
      <WireframeBox dashed className="bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-mono font-bold text-foreground">Students Needing Support</span>
          </div>
          <div className="flex items-center gap-1.5 border border-dashed border-border rounded px-2 py-1">
            <Brain className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">AI-analyzed</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {flaggedStudents.map((student, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border border-dashed border-border rounded p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                student.severity === "high" ? "bg-destructive" : "bg-warning"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-foreground">{student.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5">
                    {student.class}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1 leading-relaxed">
                  {student.reason}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </WireframeBox>
    </Annotation>
  )
}
