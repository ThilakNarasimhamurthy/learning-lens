"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Upload,
  Brain,
  FileText,
  Lightbulb,
  PenLine,
  CheckCircle2,
  FileUp,
  Loader2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Check,
  CircleDot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  demoStudent,
  essayText,
  aiAnalysis,
  rubricMapping,
  guidingPrompts,
  studentResponse as prefilledResponse,
  evaluation,
} from "@/lib/demo-data"
import type { RubricStatus } from "@/lib/demo-data"

const steps = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "AI Analysis", icon: Brain },
  { id: 3, label: "Rubric Map", icon: FileText },
  { id: 4, label: "Prompts", icon: Lightbulb },
  { id: 5, label: "Respond", icon: PenLine },
  { id: 6, label: "Evaluation", icon: CheckCircle2 },
]

function statusColor(s: RubricStatus) {
  if (s === "met") return "bg-emerald-500/15 text-emerald-700 border-emerald-200"
  if (s === "partial") return "bg-amber-500/15 text-amber-700 border-amber-200"
  return "bg-red-500/15 text-red-700 border-red-200"
}
function statusLabel(s: RubricStatus) {
  if (s === "met") return "Met"
  if (s === "partial") return "Partial"
  return "Missing"
}
function scoreBarColor(score: number) {
  if (score >= 75) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

interface StudentWorkflowProps {
  onComplete: () => void
}

export function StudentWorkflow({ onComplete }: StudentWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [responseText, setResponseText] = useState("")

  const handleUpload = useCallback(() => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setUploaded(true)
    }, 1800)
  }, [])

  const handleAnalyze = useCallback(() => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalyzed(true)
    }, 2500)
  }, [])

  useEffect(() => {
    if (currentStep === 2 && !analyzed && !analyzing) {
      handleAnalyze()
    }
  }, [currentStep, analyzed, analyzing, handleAnalyze])

  const wordCount = responseText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Workflow</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {demoStudent.name} &middot; {demoStudent.class} &middot; {demoStudent.assignment}
          </p>
        </div>
        <span className="text-xs font-mono bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
          Step {currentStep} of 6
        </span>
      </div>

      {/* Step Progress Bar */}
      <nav className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isActive = step.id === currentStep
          const isDone = step.id < currentStep
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (step.id <= currentStep) setCurrentStep(step.id)
                }}
                disabled={step.id > currentStep}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/10 text-primary hover:bg-primary/15 cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <step.icon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden lg:inline truncate">{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mx-0.5" />
              )}
            </div>
          )
        })}
      </nav>

      {/* Step Content */}
      <div className="min-h-[480px]">
        {/* ===== STEP 1: Upload ===== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
              <h2 className="text-lg font-semibold text-foreground">Upload Evidence</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit your essay for AI-powered analysis. The system will extract text,
                identify key concepts, and map your work against the assignment rubric.
              </p>

              {!uploaded ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 transition-colors ${
                    uploading
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <p className="text-sm font-medium text-foreground">
                        Processing document...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Extracting text and preparing for analysis
                      </p>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-10 w-10 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Drop your file here or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOCX, or TXT up to 10 MB
                        </p>
                      </div>
                      <Button onClick={handleUpload} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Sarah_Johnson_Essay.pdf
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Sarah_Johnson_Essay_Civil_Rights.pdf
                      </p>
                      <p className="text-xs text-muted-foreground">
                        4 paragraphs extracted &middot; 287 words
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Extracted Text Preview
                    </h3>
                    <div className="text-sm text-foreground leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                      {essayText}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {uploaded && (
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} className="gap-2">
                  Continue to AI Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: AI Analysis ===== */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Analysis</h2>
                  <p className="text-sm text-muted-foreground">
                    Extracting concepts and evaluating skill levels
                  </p>
                </div>
              </div>

              {analyzing && (
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Analyzing essay content...
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Extracting concepts</span>
                    <span>&middot;</span>
                    <span>Scoring skills</span>
                    <span>&middot;</span>
                    <span>Generating summary</span>
                  </div>
                </div>
              )}

              {analyzed && (
                <div className="flex flex-col gap-6">
                  {/* Key Concepts */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Key Concepts Identified
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.keyConcepts.map((c) => (
                        <span
                          key={c.label}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                          {c.label}
                          <span className="text-xs opacity-60">
                            {Math.round(c.confidence * 100)}%
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skill Scores */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Skill Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiAnalysis.skillScores.map((s) => (
                        <div
                          key={s.skill}
                          className="flex flex-col gap-2 p-3 rounded-lg border"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {s.skill}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                s.score >= 75
                                  ? "text-emerald-600"
                                  : s.score >= 60
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }`}
                            >
                              {s.score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor(s.score)}`}
                              style={{ width: `${s.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      AI Summary
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-foreground leading-relaxed">
                        {aiAnalysis.summary}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {analyzed && (
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(3)} className="gap-2">
                  View Rubric Mapping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 3: Rubric Mapping ===== */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Rubric Mapping</h2>
                  <p className="text-sm text-muted-foreground">
                    Your essay mapped against each rubric criterion
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Met
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Partial
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Missing
                </span>
              </div>

              {/* Cards (mobile-friendly alternative to table) */}
              <div className="flex flex-col gap-3">
                {rubricMapping.map((row) => (
                  <div key={row.criterion} className="rounded-lg border p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {row.criterion}
                        </p>
                        <p className="text-xs text-muted-foreground">{row.level}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor(row.status)}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                        <span className="text-sm font-mono font-bold text-foreground">
                          {row.score}
                          <span className="text-muted-foreground font-normal">
                            /{row.maxScore}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-muted/50">
                        <span className="font-semibold text-foreground">Evidence: </span>
                        <span className="text-muted-foreground">{row.evidenceFound}</span>
                      </div>
                      <div className="p-2.5 rounded bg-muted/50">
                        <span className="font-semibold text-foreground">Gap: </span>
                        <span className="text-muted-foreground">{row.gap}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Score Summary */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">
                    {rubricMapping.reduce((a, r) => a + r.score, 0)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {rubricMapping.reduce((a, r) => a + r.maxScore, 0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium">Initial Assessment</p>
                  <p className="text-xs text-muted-foreground">
                    {rubricMapping.filter((r) => r.status === "met").length} criteria met,{" "}
                    {rubricMapping.filter((r) => r.status === "partial").length} partial,{" "}
                    {rubricMapping.filter((r) => r.status === "missing").length} missing
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(4)} className="gap-2">
                View Guiding Prompts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Guiding Prompts ===== */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Guiding Prompts</h2>
                  <p className="text-sm text-muted-foreground">
                    AI-generated questions targeting your rubric gaps
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {guidingPrompts.map((gp) => (
                  <div
                    key={gp.id}
                    className="rounded-lg border p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {gp.id}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          Targets:{" "}
                          <span className="text-foreground">{gp.targetGap}</span>
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          gp.difficulty === "Synthesis"
                            ? "bg-primary/10 text-primary"
                            : gp.difficulty === "Analytical"
                              ? "bg-amber-500/15 text-amber-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {gp.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {gp.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(5)} className="gap-2">
                Write Response
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 5: Student Response ===== */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PenLine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Your Response</h2>
                  <p className="text-sm text-muted-foreground">
                    Revise your work using the guiding prompts
                  </p>
                </div>
              </div>

              {/* Prompt reminders */}
              <div className="p-4 rounded-lg bg-muted/50 border flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Remember to address
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {guidingPrompts.map((gp) => (
                    <li key={gp.id} className="flex items-start gap-2">
                      <CircleDot className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {gp.targetGap}:
                        </span>{" "}
                        {gp.prompt.slice(0, 80)}...
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Textarea */}
              <div className="flex flex-col gap-2">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your revised response here..."
                  rows={12}
                  className="w-full rounded-lg border bg-background p-4 text-sm text-foreground leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {wordCount} word{wordCount !== 1 ? "s" : ""}
                  </span>
                  {responseText.length === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResponseText(prefilledResponse)}
                    >
                      Load sample response
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(6)}
                disabled={wordCount < 10}
                className="gap-2"
              >
                Submit for Evaluation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 6: Evaluation ===== */}
        {currentStep === 6 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border bg-card p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Evaluation Results
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    AI-generated scores and feedback on your revision
                  </p>
                </div>
              </div>

              {/* Score Hero */}
              <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-xl bg-muted/50 border">
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative h-28 w-28">
                    <svg
                      className="h-28 w-28 -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(evaluation.overallScore / 100) * 327} 327`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-foreground">
                        {evaluation.overallScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {evaluation.maxScore}
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 text-lg font-bold text-primary">
                    {evaluation.grade}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
                    <ArrowRight className="h-3 w-3 -rotate-45" />
                    {evaluation.improvement}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed mt-2">
                    {evaluation.feedback}
                  </p>
                </div>
              </div>

              {/* Per-criterion before/after */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Score Breakdown (Before / After)
                </h3>
                <div className="flex flex-col gap-3">
                  {evaluation.criterionScores.map((c) => (
                    <div
                      key={c.criterion}
                      className="flex flex-col gap-2 p-3 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {c.criterion}
                        </span>
                        <span className="text-sm font-mono">
                          <span className="text-muted-foreground">{c.before}</span>
                          <span className="text-muted-foreground mx-1">
                            {"->"}
                          </span>
                          <span className="font-bold text-foreground">
                            {c.after}
                          </span>
                          <span className="text-muted-foreground">/{c.max}</span>
                        </span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-muted-foreground/30"
                            style={{
                              width: `${(c.before / c.max) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreBarColor((c.after / c.max) * 100)}`}
                            style={{
                              width: `${(c.after / c.max) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Before</span>
                        <span>After</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={onComplete} className="gap-2">
                Send to Teacher Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
