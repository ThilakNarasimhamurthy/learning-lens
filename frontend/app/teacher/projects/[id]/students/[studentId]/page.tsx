"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import {
  getProject,
  getEvidenceByStudent,
  getFeedbackByEvidence,
  getRubricForMilestone,
  getClassesByStudent,
} from '@/lib/data-store'
import { getUserById } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ChevronLeft, ChevronRight, Smile, Meh, FileText, Link2 } from 'lucide-react'

function ProgressReportContent() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const studentId = params.studentId as string
  const [project, setProject] = useState<ReturnType<typeof getProject>>(null)
  const [evidence, setEvidence] = useState<ReturnType<typeof getEvidenceByStudent>>([])
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const proj = getProject(projectId)
    setProject(proj ?? null)
    if (projectId && studentId) {
      setEvidence(getEvidenceByStudent(studentId, projectId))
    }
  }, [projectId, studentId])

  if (!project) return <div className="p-8">Loading...</div>

  const studentName = getUserById(studentId)?.name ?? studentId
  const studentClasses = getClassesByStudent(studentId).filter((c) => c.projectIds.includes(projectId))
  const className = studentClasses[0]?.name ?? 'Class'

  // Use first milestone with evidence, or first milestone
  const milestoneIds = project.milestones.map((m) => m.id)
  const firstEvidenceMilestone = evidence[0]?.milestoneId ?? milestoneIds[0]
  const evidenceForCheckpoint = evidence.filter((e) => e.milestoneId === firstEvidenceMilestone)
  const currentMilestone = project.milestones.find((m) => m.id === firstEvidenceMilestone)
  const checkpointNum = project.milestones.findIndex((m) => m.id === firstEvidenceMilestone) + 1 || 1

  // Get latest evidence for this checkpoint (for feedback)
  const latestEvidence = [...evidenceForCheckpoint].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )[0]
  const feedbacks = latestEvidence ? getFeedbackByEvidence(latestEvidence.id) : []
  const rubric = getRubricForMilestone(project, firstEvidenceMilestone)

  const avgScore = feedbacks.length > 0
    ? feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length
    : 0
  const isDemoComposting =
    project.title.toLowerCase().includes('composting') && studentId === 's1'
  const levelLabel = isDemoComposting
    ? 'Beginning'
    : avgScore >= 3.5 ? 'Advanced' : avgScore >= 2.5 ? 'Proficient' : avgScore >= 1.5 ? 'Developing' : 'Beginning'
  const levelScore = isDemoComposting ? 1 : Math.round(avgScore) || 1
  const assessmentNote =
    feedbacks.find((f) => f.gaps?.length)?.gaps?.[0] ??
    feedbacks.find((f) => f.nextSteps)?.nextSteps ??
    'Failed to demonstrate thinking and reasoning. only provided online resources.'

  // Teacher dashboard: use area-of-improvement framing (not student-facing "consider submitting" language)
  const matchingCriterionDescription =
    "Area of improvement: The resource identifies that the pile smells, but it lacks the diagnostic depth to explain why (e.g., an excess of nitrogen/greens). To improve this, find a source that links the ammonia scent to the need for specific 'carbon-rich' bulking agents."

  const matchCriteria = feedbacks.map((fb, idx) => {
    const criterion = rubric.find((r) => r.id === fb.criterionId)
    let matchType: 'strong' | 'partial' = fb.score >= 3 ? 'strong' : 'partial'
    // Demo: Troubleshooting Logic and Engineering Refinement → Partial Match for consistent story
    if (isDemoComposting && criterion) {
      const name = criterion.name.toLowerCase()
      if (name.includes('troubleshooting') || name.includes('engineering')) matchType = 'partial'
    }
    return {
      name: criterion?.name ?? 'Criterion',
      description: criterion?.description ?? '',
      matchType,
    }
  })

  if (matchCriteria.length === 0 && rubric.length > 0) {
    rubric.forEach((c) => {
      const name = c.name.toLowerCase()
      const matchType: 'strong' | 'partial' =
        isDemoComposting && (name.includes('troubleshooting') || name.includes('engineering'))
          ? 'partial'
          : isDemoComposting && name.includes('climate')
            ? 'strong'
            : 'partial'
      matchCriteria.push({
        name: c.name,
        description: c.description,
        matchType,
      })
    })
  }

  const carouselItems = evidenceForCheckpoint.length > 0 ? evidenceForCheckpoint : [null, null, null]

  const scrollCarousel = (dir: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' })
    }
  }

  const getEvidenceDisplay = (ev: (typeof evidenceForCheckpoint)[0]) => {
    if (!ev) return { label: 'Written', name: '', isPdf: false, isArticle: false }
    const isPdf = ev.fileType === 'pdf' || ev.fileName || ev.content?.startsWith('PDF:')
    const isArticle = ev.content?.startsWith('Article:')
    const label = isPdf ? 'PDF' : isArticle ? 'Article' : 'Written'
    const raw =
      ev.fileName ||
      (isPdf ? ev.content?.replace(/^PDF:\s*/, '') : null) ||
      (isArticle ? ev.content?.replace(/^Article:\s*/, '').replace(/^https?:\/\//, '') : null) ||
      ev.content ||
      'Evidence'
    const name = raw.length > 50 ? raw.slice(0, 50) + '…' : raw
    return { label, name, isPdf, isArticle }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push('/teacher/dashboard')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Learning Lens</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{className}</span>
              <span>{project.title}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Progress Report</h2>
          <p className="text-lg font-medium text-gray-700 mt-0.5">{studentName}</p>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Checkpoint {checkpointNum}
            {currentMilestone && (
              <span className="font-normal text-gray-600 block mt-0.5">
                {currentMilestone.name}
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">Learning Evidence</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => scrollCarousel(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto flex-1 py-2 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {carouselItems.map((ev, i) => {
                const display = ev ? getEvidenceDisplay(ev) : null
                return (
                  <div
                    key={ev?.id ?? i}
                    className="shrink-0 w-48 rounded-lg border border-gray-200 bg-white flex flex-col overflow-hidden"
                  >
                    {ev ? (
                      <>
                        <div className="aspect-[4/3] rounded-t-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          {display?.isPdf || display?.label === 'Written' ? (
                            <FileText className="h-10 w-10 text-gray-400" />
                          ) : (
                            <Link2 className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        <div className="p-3 flex flex-col gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className="text-[10px] w-fit bg-gray-100 text-gray-700 border-gray-200">
                            {display?.label ?? 'Written'}
                          </Badge>
                          <p className="text-xs font-medium text-gray-900 truncate" title={ev.content}>
                            {display?.name ?? 'Evidence'}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-auto">
                            {new Date(ev.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center min-h-[140px]">
                        <span className="text-gray-300 text-4xl">—</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => scrollCarousel(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Matching Criterion</h3>
            <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-700">
              AI Generated
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            {matchingCriterionDescription}
          </p>
          <div className="space-y-3">
            {matchCriteria.map((m, idx) => (
              <div
                key={`${m.name}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-600">{m.description}</p>
                </div>
                <Badge
                  className={
                    m.matchType === 'strong'
                      ? 'bg-green-100 text-green-800 border-green-200 shrink-0'
                      : 'bg-amber-100 text-amber-800 border-amber-200 shrink-0'
                  }
                >
                  {m.matchType === 'strong' ? (
                    <span className="flex items-center gap-1">
                      <Smile className="h-3.5 w-3.5" />
                      Strong Match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Meh className="h-3.5 w-3.5" />
                      Partial Match
                    </span>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Assessment</h3>
            <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-700">
              AI Generated
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  levelScore >= 3 ? 'bg-green-500' : levelScore >= 2 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                aria-hidden
              />
              <p className="font-semibold text-gray-900">
                {levelLabel} ({levelScore})
              </p>
            </div>
            <p className="text-sm text-gray-600">{assessmentNote}</p>
            {latestEvidence && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2">Assessment artifact</p>
                <div className="shrink-0 w-full max-w-[192px] rounded-lg border border-gray-200 bg-white flex flex-col overflow-hidden">
                  <div className="aspect-[4/3] rounded-t-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const d = getEvidenceDisplay(latestEvidence)
                      return d?.isPdf || d?.label === 'Written' ? (
                        <FileText className="h-10 w-10 text-gray-400" />
                      ) : (
                        <Link2 className="h-10 w-10 text-gray-400" />
                      )
                    })()}
                  </div>
                  <div className="p-3 flex flex-col gap-2 flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px] w-fit bg-gray-100 text-gray-700 border-gray-200">
                      {getEvidenceDisplay(latestEvidence)?.label ?? 'Written'}
                    </Badge>
                    <p className="text-xs font-medium text-gray-900 truncate" title={latestEvidence.content}>
                      {getEvidenceDisplay(latestEvidence)?.name ?? 'Evidence'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {new Date(latestEvidence.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function ProgressReportPage() {
  return (
    <AuthGuard requiredRole="teacher">
      <ProgressReportContent />
    </AuthGuard>
  )
}
