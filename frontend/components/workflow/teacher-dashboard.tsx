"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Brain,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
  RefreshCw,
  X,
  Upload,
  FileText,
  Lightbulb,
  PenLine,
  CheckCircle2,
  Bell,
  CalendarPlus,
  Mail,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  allStudents,
  classSummaries,
  demoStudent,
  essayText,
  aiAnalysis,
  rubricMapping,
  guidingPrompts,
  studentResponse,
  evaluation,
} from "@/lib/demo-data"
import type { StudentRecord } from "@/lib/demo-data"

function statusDotColor(status: StudentRecord["status"]) {
  if (status === "critical") return "bg-red-500"
  if (status === "needs-support") return "bg-amber-500"
  return "bg-emerald-500"
}

function StatusBadge({ status }: { status: StudentRecord["status"] }) {
  const config = {
    critical: { bg: "bg-red-500/10", text: "text-red-700", label: "Critical" },
    "needs-support": { bg: "bg-amber-500/10", text: "text-amber-700", label: "At Risk" },
    "on-track": { bg: "bg-emerald-500/10", text: "text-emerald-700", label: "On Track" },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor(status)}`} />
      {c.label}
    </span>
  )
}

// ---- Submission Drawer ----
function SubmissionDrawer({ student, onClose }: { student: StudentRecord; onClose: () => void }) {
  const isDemoStudent = student.id === "s1"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-background border-l overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
            <p className="text-xs text-muted-foreground">{student.class} &middot; {student.assignment}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {isDemoStudent ? (
            <>
              {/* Step 1: Upload */}
              <DrawerSection icon={Upload} title="1. Uploaded Evidence" badge="Composting">
                <div className="text-xs text-foreground leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line bg-muted/50 p-3 rounded-lg">
                  {essayText.slice(0, 600)}...
                </div>
              </DrawerSection>

              {/* Step 2: AI Analysis */}
              <DrawerSection icon={Brain} title="2. AI Analysis">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {aiAnalysis.keyConcepts.slice(0, 5).map((c) => (
                    <span key={c.label} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {c.label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {aiAnalysis.skillScores.map((s) => (
                    <div key={s.skill} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-28">{s.skill}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.score >= 75 ? "bg-emerald-500" : s.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground w-8 text-right">{s.score}%</span>
                    </div>
                  ))}
                </div>
              </DrawerSection>

              {/* Step 3: Rubric */}
              <DrawerSection icon={FileText} title="3. Rubric Mapping">
                <div className="flex flex-col gap-2">
                  {rubricMapping.map((r) => (
                    <div key={r.criterion} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-xs font-medium text-foreground">{r.criterion}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          r.status === "met" ? "bg-emerald-500/15 text-emerald-700 border-emerald-200"
                          : r.status === "partial" ? "bg-amber-500/15 text-amber-700 border-amber-200"
                          : "bg-red-500/15 text-red-700 border-red-200"
                        }`}>{r.score}/{r.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerSection>

              {/* Step 4: Prompts */}
              <DrawerSection icon={Lightbulb} title="4. Guiding Prompts">
                <div className="flex flex-col gap-2">
                  {guidingPrompts.map((gp) => (
                    <div key={gp.id} className="p-2.5 rounded-lg border text-xs text-foreground leading-relaxed">
                      <span className="font-semibold text-primary">#{gp.id} {gp.targetGap}:</span>{" "}
                      {gp.prompt.slice(0, 120)}...
                    </div>
                  ))}
                </div>
              </DrawerSection>

              {/* Step 5: Response */}
              <DrawerSection icon={PenLine} title="5. Student Response" badge={`${studentResponse.split(/\s+/).length} words`}>
                <div className="text-xs text-foreground leading-relaxed max-h-32 overflow-y-auto bg-muted/50 p-3 rounded-lg whitespace-pre-line">
                  {studentResponse.slice(0, 500)}...
                </div>
              </DrawerSection>

              {/* Step 6: Evaluation */}
              <DrawerSection icon={CheckCircle2} title="6. Evaluation" badge={`${evaluation.overallScore}/${evaluation.maxScore} (${evaluation.grade})`}>
                <div className="flex flex-col gap-2">
                  {evaluation.criterionScores.map((c) => (
                    <div key={c.criterion} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-32">{c.criterion}</span>
                      <div className="flex-1 flex gap-1 h-1.5">
                        <div className="flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: `${(c.before / c.max) * 100}%` }} />
                        </div>
                        <div className="flex-1 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${(c.after / c.max) >= 0.75 ? "bg-emerald-500" : (c.after / c.max) >= 0.6 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${(c.after / c.max) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-foreground w-14 text-right">{c.before}{"->"}{c.after}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-foreground leading-relaxed mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-200">
                  {evaluation.feedback}
                </p>
              </DrawerSection>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Submission details</p>
              <p className="text-xs text-muted-foreground max-w-[280px]">
                In the full app, this drawer would show {student.name}{"'"}s complete workflow journey. Run the Student Demo to see a full example with Alex Chen.
              </p>
              {student.flagged && student.flagReason && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-200 text-xs text-foreground leading-relaxed max-w-sm text-left">
                  <span className="font-semibold text-red-700">AI Flag Reason:</span> {student.flagReason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DrawerSection({ icon: Icon, title, badge, children }: { icon: React.ComponentType<{ className?: string }>; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {badge && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-auto">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ---- Flagged Card ----
function FlaggedCard({ student, onView }: { student: StudentRecord; onView: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
          student.flagSeverity === "high" ? "bg-red-500" : "bg-amber-500"
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{student.name}</span>
            <span className="text-xs font-mono text-muted-foreground bg-muted rounded px-1.5 py-0.5">{student.class}</span>
            <span className="text-xs font-mono font-bold text-foreground ml-auto">{student.score}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{student.flagReason}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onView}>
              <Eye className="h-3.5 w-3.5" /> View Submission
            </Button>
            <div className="relative">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowActions(!showActions)}>
                Take Action <ChevronDown className="h-3 w-3" />
              </Button>
              {showActions && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-card border rounded-lg shadow-lg z-10">
                  {[
                    { icon: CalendarPlus, label: "Schedule meeting" },
                    { icon: Mail, label: "Send message" },
                    { icon: ClipboardList, label: "Assign review task" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => setShowActions(false)}
                    >
                      <action.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last activity: {student.lastActivity}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Main Teacher Dashboard ----
interface TeacherDashboardProps {
  showNewResult?: boolean
}

export function TeacherDashboard({ showNewResult = false }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"flagged" | "all">("flagged")
  const [classFilter, setClassFilter] = useState("All")
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null)
  const [dismissedNotif, setDismissedNotif] = useState(false)

  const flaggedStudents = allStudents.filter((s) => s.flagged)
  const classes = ["All", ...Array.from(new Set(allStudents.map((s) => s.class)))]
  const filteredStudents = classFilter === "All" ? allStudents : allStudents.filter((s) => s.class === classFilter)
  const sortedStudents = [...filteredStudents].sort((a, b) => a.score - b.score)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor student progress and review AI-flagged submissions</p>
      </div>

      {/* New Result Notification */}
      {showNewResult && !dismissedNotif && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-in slide-in-from-top-2">
          <Bell className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">New result arrived</p>
            <p className="text-xs text-muted-foreground">
              {demoStudent.name} completed the {demoStudent.assignment} workflow. Score: {evaluation.overallScore}/{evaluation.maxScore} ({evaluation.grade})
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => { setViewingStudent(allStudents[0]); setDismissedNotif(true) }}>
            <Eye className="h-3.5 w-3.5" /> View
          </Button>
          <button onClick={() => setDismissedNotif(true)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Students", value: allStudents.length, icon: Users, dotColor: "bg-primary" },
          { label: "Critical", value: allStudents.filter((s) => s.status === "critical").length, icon: AlertTriangle, dotColor: "bg-red-500" },
          { label: "At Risk", value: allStudents.filter((s) => s.status === "needs-support").length, icon: AlertTriangle, dotColor: "bg-amber-500" },
          { label: "On Track", value: allStudents.filter((s) => s.status === "on-track").length, icon: TrendingUp, dotColor: "bg-emerald-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg border p-4 flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${stat.dotColor}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Class Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {classSummaries.map((cls) => (
          <div key={cls.name} className="rounded-lg border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{cls.name}</span>
              <span className="text-xs text-muted-foreground">{cls.students} students</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${cls.avgScore >= 70 ? "bg-emerald-500" : cls.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${cls.avgScore}%` }} />
              </div>
              <span className="text-sm font-mono font-bold text-foreground">{cls.avgScore}%</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {cls.onTrack} on track</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {cls.needsSupport} at risk</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {cls.critical} critical</span>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-between bg-card rounded-lg border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">AI analysis synced: Feb 23, 2026 at 10:42 AM</span>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("flagged")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "flagged" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Flagged
          <span className="bg-red-500/10 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{flaggedStudents.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          All Students
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "flagged" ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI-Flagged Action Feed</span>
          </div>

          {/* High severity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">{"Critical (<60%)"}</span>
            </div>
            <div className="flex flex-col gap-2">
              {flaggedStudents.filter((s) => s.flagSeverity === "high").map((s) => (
                <FlaggedCard key={s.id} student={s} onView={() => setViewingStudent(s)} />
              ))}
            </div>
          </div>

          {/* Medium severity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">At Risk (60-69%)</span>
            </div>
            <div className="flex flex-col gap-2">
              {flaggedStudents.filter((s) => s.flagSeverity === "medium").map((s) => (
                <FlaggedCard key={s.id} student={s} onView={() => setViewingStudent(s)} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Class Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  classFilter === c ? "bg-primary text-primary-foreground" : "bg-card border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Student Table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 border-b">
              <span className="col-span-3">Student</span>
              <span className="col-span-3">Class</span>
              <span className="col-span-2">Score</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Action</span>
            </div>
            {sortedStudents.map((s) => (
              <div
                key={s.id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm border-b last:border-0 hover:bg-muted/30 transition-colors ${
                  s.status === "critical" ? "bg-red-500/5" : s.status === "needs-support" ? "bg-amber-500/5" : ""
                }`}
              >
                <div className="col-span-3 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                    {s.avatar}
                  </div>
                  <span className="text-foreground font-medium truncate">{s.name}</span>
                </div>
                <span className="col-span-3 text-xs text-muted-foreground">{s.class}</span>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.score >= 70 ? "bg-emerald-500" : s.score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">{s.score}%</span>
                </div>
                <span className="col-span-2"><StatusBadge status={s.status} /></span>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => setViewingStudent(s)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Drawer */}
      {viewingStudent && (
        <SubmissionDrawer student={viewingStudent} onClose={() => setViewingStudent(null)} />
      )}
    </div>
  )
}
