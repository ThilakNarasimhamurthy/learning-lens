import {
  Upload,
  Brain,
  ClipboardList,
  MessageSquare,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
  ArrowDown,
} from "lucide-react"

const studentSteps = [
  { label: "Upload Evidence", icon: Upload, desc: "PDF / Word" },
  { label: "AI Analysis", icon: Brain, desc: "Extract meaning" },
  { label: "Rubric Mapping", icon: ClipboardList, desc: "Map to criteria" },
  { label: "Guiding Prompts", icon: MessageSquare, desc: "AI guidance" },
  { label: "Student Response", icon: PenTool, desc: "Revise work" },
  { label: "AI Evaluation", icon: CheckCircle2, desc: "Grade + feedback" },
]

const teacherSteps = [
  { label: "Flagged Students", icon: AlertTriangle, desc: "Action feed" },
  { label: "All Students", icon: Users, desc: "Full progress view" },
]

export function FlowDiagram() {
  return (
    <div className="flex flex-col gap-8">
      {/* Student Flow */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <PenTool className="h-3.5 w-3.5 text-primary" />
          </div>
          <h4 className="text-sm font-sans font-semibold text-foreground">Student Workflow</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {studentSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3 min-w-[140px]">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-sans font-semibold text-card-foreground leading-tight">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
              </div>
              {i < studentSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-border shrink-0 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Connector */}
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <ArrowDown className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-mono text-primary font-medium uppercase tracking-wider">
            Results feed into dashboard
          </span>
          <ArrowDown className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Teacher Flow */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <h4 className="text-sm font-sans font-semibold text-foreground">Teacher Dashboard</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {teacherSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3 min-w-[180px]">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-sans font-semibold text-card-foreground leading-tight">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
              </div>
              {i < teacherSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-border shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
