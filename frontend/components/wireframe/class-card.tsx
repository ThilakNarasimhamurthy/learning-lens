"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Users, Clock, AlertTriangle, Brain, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { WireframeBox, Placeholder } from "./annotation"

interface Student {
  name: string
  progress: number
  trend: "up" | "down" | "flat"
  flagged: boolean
  llmInsight: string
  lastActive: string
}

interface ClassData {
  name: string
  grade: string
  studentCount: number
  avgProgress: number
  flaggedCount: number
  lastUpdated: string
  students: Student[]
}

export function ClassCard({ data }: { data: ClassData }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <WireframeBox className="bg-card">
      {/* Class Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded border border-dashed border-border flex items-center justify-center bg-muted">
            <span className="text-xs font-mono font-bold text-foreground">{data.grade}</span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-mono font-bold text-foreground">{data.name}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> {data.studentCount} students
              </span>
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {data.lastUpdated}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">Avg</span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/40 rounded-full"
                style={{ width: `${data.avgProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-foreground">{data.avgProgress}%</span>
          </div>

          {/* Flag count */}
          {data.flaggedCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono border border-dashed border-destructive/50 rounded px-1.5 py-0.5 text-destructive">
              <AlertTriangle className="h-3 w-3" /> {data.flaggedCount}
            </span>
          )}

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Student List */}
      {expanded && (
        <div className="mt-4 border-t border-dashed border-border pt-4">
          {/* Annotation */}
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              LLM Analysis - Student Progress
            </span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
            <span className="col-span-3">Student</span>
            <span className="col-span-2">Progress</span>
            <span className="col-span-1 text-center">Trend</span>
            <span className="col-span-4">LLM Insight</span>
            <span className="col-span-1 text-center">Flag</span>
            <span className="col-span-1 text-right">Active</span>
          </div>

          {/* Student rows */}
          {data.students.map((student, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 gap-2 px-2 py-2 items-center text-xs font-mono ${
                student.flagged ? "bg-destructive/5 border border-dashed border-destructive/20 rounded" : "border-b border-border/50"
              }`}
            >
              {/* Name */}
              <div className="col-span-3 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-muted shrink-0" />
                <span className="text-foreground truncate">{student.name}</span>
              </div>

              {/* Progress */}
              <div className="col-span-2 flex items-center gap-1.5">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      student.progress >= 70
                        ? "bg-foreground/50"
                        : student.progress >= 40
                        ? "bg-foreground/30"
                        : "bg-destructive/50"
                    }`}
                    style={{ width: `${student.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-7 text-right">{student.progress}%</span>
              </div>

              {/* Trend */}
              <div className="col-span-1 flex justify-center">
                {student.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : student.trend === "down" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* LLM Insight */}
              <div className="col-span-4">
                <span className="text-[10px] text-muted-foreground leading-tight block truncate">
                  {student.llmInsight}
                </span>
              </div>

              {/* Flag */}
              <div className="col-span-1 flex justify-center">
                {student.flagged && (
                  <div className="h-5 w-5 border border-dashed border-destructive/50 rounded flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                  </div>
                )}
              </div>

              {/* Last active */}
              <div className="col-span-1 text-right">
                <span className="text-[10px] text-muted-foreground">{student.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WireframeBox>
  )
}
