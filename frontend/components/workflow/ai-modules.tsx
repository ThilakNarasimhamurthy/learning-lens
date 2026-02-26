import {
  FileSearch,
  ClipboardList,
  MessageSquare,
  Award,
  MessageCircle,
  Flag,
  ArrowDown,
} from "lucide-react"

const modules = [
  {
    id: 1,
    title: "Evidence Extraction",
    description: "Parses uploaded files, extracts text, identifies key concepts and learning indicators from student submissions.",
    icon: FileSearch,
  },
  {
    id: 2,
    title: "Rubric Mapping",
    description: "Maps extracted evidence against selected rubric criteria. Determines met, partially met, and missing standards.",
    icon: ClipboardList,
  },
  {
    id: 3,
    title: "Guiding Prompt Generator",
    description: "Generates targeted, personalized prompts based on evidence quality, rubric gaps, and learning objectives.",
    icon: MessageSquare,
  },
  {
    id: 4,
    title: "Rubric Grading Engine",
    description: "Evaluates final submissions against rubric criteria. Produces per-criterion scores and overall assessment.",
    icon: Award,
  },
  {
    id: 5,
    title: "Feedback Generator",
    description: "Creates concise, actionable feedback summaries for students and teachers based on grading results.",
    icon: MessageCircle,
  },
  {
    id: 6,
    title: "Flagging Logic",
    description: "Identifies at-risk students based on scores, trends, and engagement patterns. Triggers dashboard alerts.",
    icon: Flag,
  },
]

export function AIModules() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        These are the AI functional modules that power the platform behind the scenes. 
        Each module handles a specific part of the analysis pipeline.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, i) => (
          <div key={mod.id} className="relative">
            <div className="bg-card rounded-lg border border-border p-5 h-full flex flex-col gap-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <mod.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground">Module {mod.id}</span>
                  <h4 className="text-sm font-sans font-semibold text-card-foreground leading-tight">
                    {mod.title}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
            </div>

            {/* Connector arrow between rows */}
            {i < modules.length - 1 && i % 3 !== 2 && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:block">
                <ArrowDown className="h-4 w-4 text-border rotate-[-90deg]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
