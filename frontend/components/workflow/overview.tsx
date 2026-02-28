"use client"

import { ArrowRight, BookOpen, Brain, ChevronRight, GraduationCap, Upload, FileText, Lightbulb, PenLine, CheckCircle2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const pipelineSteps = [
  { icon: Upload, label: "Upload", desc: "Student submits work" },
  { icon: Brain, label: "AI Analysis", desc: "Extract concepts & scores" },
  { icon: FileText, label: "Rubric Map", desc: "Map to criteria gaps" },
  { icon: Lightbulb, label: "Prompts", desc: "AI guiding questions" },
  { icon: PenLine, label: "Respond", desc: "Student revises work" },
  { icon: CheckCircle2, label: "Evaluate", desc: "Score & feedback" },
]

interface OverviewProps {
  onNavigate: (view: string) => void
}

export function Overview({ onNavigate }: OverviewProps) {
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 pt-6">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <GraduationCap className="h-4 w-4" />
          <span>Interactive Demo</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance">
          AI-Powered Student Assessment
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
          Walk through the complete journey: a student uploads evidence for the Composting Systems
          project, AI analyzes it against the rubric, generates targeted prompts, the student revises,
          and the teacher sees everything on their dashboard.
        </p>
        <div className="flex gap-3 pt-2">
          <Button size="lg" onClick={() => onNavigate("student")} className="gap-2">
            Start Student Demo
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate("teacher")} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Teacher Dashboard
          </Button>
        </div>
      </section>

      {/* Pipeline Visual */}
      <section className="flex flex-col gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
          End-to-End Workflow
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-0 items-start">
          {pipelineSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center gap-3 relative">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary ring-1 ring-border">
                <step.icon className="h-6 w-6" />
              </div>
              {i < pipelineSteps.length - 1 && (
                <ChevronRight className="hidden md:block absolute top-4 -right-2 h-5 w-5 text-muted-foreground/50" />
              )}
              <div className="flex flex-col items-center text-center gap-0.5">
                <span className="text-sm font-semibold text-foreground">{step.label}</span>
                <span className="text-xs text-muted-foreground leading-snug max-w-[110px]">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Context Card */}
      <section className="rounded-xl border bg-card p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">Demo Scenario</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are following <span className="font-medium text-foreground">Alex Chen</span>, a student in{" "}
              <span className="font-medium text-foreground">Period 1 Science</span>. They have submitted evidence for the{" "}
              <span className="font-medium text-foreground">Composting Systems</span> project. The AI will analyze their
              work against the rubric, identify gaps, and generate targeted prompts to guide revision.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="rounded-lg bg-muted/50 p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">6</span>
            <span className="text-xs text-muted-foreground">Workflow Steps</span>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">3</span>
            <span className="text-xs text-muted-foreground">Rubric Criteria</span>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground">3</span>
            <span className="text-xs text-muted-foreground">AI Prompts</span>
          </div>
        </div>
      </section>

      {/* Two Role Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-10">
        <button
          onClick={() => onNavigate("student")}
          className="group rounded-xl border bg-card p-6 flex flex-col gap-4 text-left hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">Student View</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload evidence, see AI analysis and rubric mapping, answer guiding prompts, revise
              your work, and receive an evaluation with scores and feedback.
            </p>
          </div>
        </button>
        <button
          onClick={() => onNavigate("teacher")}
          className="group rounded-xl border bg-card p-6 flex flex-col gap-4 text-left hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">Teacher View</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Review flagged students, view AI-generated insights, check class-level progress, and
              drill into individual submissions to see the full student journey.
            </p>
          </div>
        </button>
      </section>
    </div>
  )
}
