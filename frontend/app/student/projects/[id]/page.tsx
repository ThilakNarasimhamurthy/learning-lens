"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser } from '@/lib/auth'
import { getProject, submitEvidence, getEvidenceByStudent, getFeedbackByEvidence, getStudentProgress, getClassesByStudent, getRubricForMilestone } from '@/lib/data-store'
import { dedupeById } from '@/lib/utils'
import type { Project, Evidence, Feedback } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Upload, CheckCircle, Clock, FileText, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Link2, ClipboardList, RefreshCw, Plus, Rocket, Trophy, AlertCircle } from 'lucide-react'
import { AIProcessSteps } from '@/components/ai-indicator'

const assessmentQuestions = [
  { id: 'q1', question: 'What is the main purpose of the evidence you uploaded?', placeholder: 'Describe how your evidence supports your learning...' },
  { id: 'q2', question: 'How well does your evidence address the rubric criteria?', placeholder: 'Explain how your submission addresses the criteria...' },
  { id: 'q3', question: 'What would you do to strengthen your submission?', placeholder: 'Reflect on areas for improvement...' },
]

/** Convert RubricCriterion[] to display format (title, subtitle, levels) */
function rubricToDisplayFormat(criteria: import('@/lib/types').RubricCriterion[]) {
  return criteria.map((c) => ({
    title: c.name,
    subtitle: c.description,
    levels: [...c.levels].sort((a, b) => b.score - a.score).map((l) => l.description),
  }))
}

function StudentProjectContent() {
  const router = useRouter()
  const params = useParams()
  const [user] = useState(getCurrentUser())
  const [project, setProject] = useState<Project | null>(null)
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [selectedMilestone, setSelectedMilestone] = useState<string>('')
  const [content, setContent] = useState('')
  const [reflection, setReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiStep, setAiStep] = useState(0)
  const [submitStep, setSubmitStep] = useState(1)
  const [articleUrl, setArticleUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const [articleMatches, setArticleMatches] = useState<
    { criterion: string; description?: string; strength: 'strong' | 'partial' }[] | null
  >(null)
  const [evidenceInputTab, setEvidenceInputTab] = useState<'article-url' | 'upload-pdf'>('article-url')
  const [expandedCheckpointId, setExpandedCheckpointId] = useState<string | null>(null)
  const [viewedMilestoneId, setViewedMilestoneId] = useState<string | null>(null)
  const [showOptionalEvidenceActions, setShowOptionalEvidenceActions] = useState(false)
  const [galleryCheckpointId, setGalleryCheckpointId] = useState<string | null>(null)
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null)
  const [selectedEvidenceIdByCheckpoint, setSelectedEvidenceIdByCheckpoint] = useState<Record<string, string>>({})
  const [expandedEvidenceIdInList, setExpandedEvidenceIdInList] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const checkpointCarouselRef = useRef<HTMLDivElement | null>(null)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({})
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false)
  const [assessmentResults, setAssessmentResults] = useState<
    Record<string, { levelLabel: string; score: number; note: string }>
  >({})

  const aiSteps = [
    'Extracting evidence',
    'Mapping to rubric',
    'Detecting gaps',
    'Generating feedback',
    'Checking flags'
  ]

  useEffect(() => {
    const proj = getProject(params.id as string)
    if (proj) {
      setProject(proj)
      if (user) {
        const ev = dedupeById(getEvidenceByStudent(user.id, proj.id))
        setEvidence(ev)
        if (ev.length > 0) {
          setActiveEvidenceId(ev[ev.length - 1].id)
        }
      }
      if (proj.milestones.length > 0) {
        if (galleryCheckpointId === null) setGalleryCheckpointId(proj.milestones[0].id)
        setViewedMilestoneId((prev) => prev || proj.milestones[0].id)
      }
    }
  }, [params.id, user])

  useEffect(() => {
    if (!user || !project) return
    const key = `learning_lens_assessment_results:${user.id}:${project.id}`
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, { levelLabel: string; score: number; note: string }>
      if (parsed && typeof parsed === 'object') {
        setAssessmentResults(parsed)
      }
    } catch {
      // ignore corrupted local storage
    }
  }, [user, project])

  const persistAssessmentResults = (next: Record<string, { levelLabel: string; score: number; note: string }>) => {
    if (!user || !project) return
    const key = `learning_lens_assessment_results:${user.id}:${project.id}`
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // ignore storage failures
    }
  }

  const handleSubmit = async (opts?: { goToEvidenceGallery?: boolean }) => {
    const contentToSubmit = content?.trim() || (articleUrl?.trim() ? `Article: ${articleUrl.trim()}` : uploadedFile ? `PDF: ${uploadedFile.name}` : '')
    if (!user || !project || !selectedMilestone || !contentToSubmit) return

    const goToEvidenceGallery = opts?.goToEvidenceGallery ?? false
    setSubmitting(true)
    setAiProcessing(true)
    
    try {
      // Simulate AI processing stages
      for (let i = 0; i < aiSteps.length; i++) {
        setAiStep(i)
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate processing time
      }
      
      const newEvidence = submitEvidence({
        studentId: user.id,
        projectId: project.id,
        milestoneId: selectedMilestone,
        content: contentToSubmit,
        reflection: reflection || '',
        fileName: uploadedFile?.name,
        fileUrl: uploadedFile?.url,
        fileType: uploadedFile ? 'pdf' : undefined,
      })
      
      // Refresh evidence from localStorage
      const updated = dedupeById(getEvidenceByStudent(user.id, project.id))
      setEvidence(updated)
      setActiveEvidenceId(newEvidence.id)

      if (goToEvidenceGallery) {
        setSubmitStep(3)
        setContent('')
        setReflection('')
        // Keep articleUrl, uploadedFile, articleMatches, selectedMilestone so Evidence Gallery can show them
      } else {
        setSubmitStep(1)
      setContent('')
      setReflection('')
      setSelectedMilestone('')
        setUploadedFile(null)
        setArticleMatches(null)
      }
      setAiProcessing(false)
      setAiStep(0)
    } catch (error) {
      console.error('Failed to submit evidence:', error)
      alert('Failed to submit. Please try again.')
      setAiProcessing(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnalyzeArticle = () => {
    if (!articleUrl.trim() && !uploadedFile) return
    // Demo: match all rubric criteria with mixed strong/partial
    const matches = rubricCategories.map((cat, index) => ({
      criterion: cat.title,
      description: cat.subtitle,
      strength: (index % 2 === 0 ? 'strong' : 'partial') as 'strong' | 'partial',
    }))
    setArticleMatches(matches)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUploadedFile({ name: file.name, url })
  }

  if (!project) return <div>Loading...</div>

  const effectiveMilestoneId = selectedMilestone || viewedMilestoneId || project.milestones[0]?.id
  const rubricCategories = rubricToDisplayFormat(getRubricForMilestone(project, effectiveMilestoneId))
  const progress = user ? getStudentProgress(user.id, project.id) : null
  const completedMilestones = progress?.completedMilestones || []
  const classNamesForProject = user
    ? getClassesByStudent(user.id).filter((c) => c.projectIds.includes(project.id)).map((c) => c.name)
    : []
  const subjectTag = project.standards?.[0]?.category || 'Project'

  const getMilestoneState = (m: (typeof project.milestones)[0]) => {
    const hasEvidence = evidence.some((ev) => ev.milestoneId === m.id)
    const now = new Date()
    const dueDate = new Date(m.dueDate)
    const isNotOpenYet = m.opensOn && new Date(m.opensOn) > now
    if (hasEvidence) return 'completed'
    if (isNotOpenYet) return 'inactive'
    if (dueDate < now) return 'past-due'
    return 'active'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Learning Lens</p>
          <h1 className="text-2xl font-bold mt-1">{project.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {classNamesForProject.map((name) => (
              <Badge key={name} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                {name}
              </Badge>
            ))}
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              {subjectTag}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Step 1: Timeline + milestone card */}
        {submitStep === 1 && (
          <>
            {/* Milestones timeline */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Milestones</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Rocket className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  {project.milestones.map((m, index) => {
                    const state = getMilestoneState(m)
                    const isViewed = viewedMilestoneId === m.id
                    return (
                      <div key={m.id} className="flex items-center flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => setViewedMilestoneId(m.id)}
                          className={`flex items-center justify-center rounded-full border-2 shrink-0 transition-all duration-200 font-semibold ${
                            isViewed ? 'w-12 h-12 text-base ring-2 ring-offset-2' : 'w-10 h-10 text-sm'
                          } ${
                            state === 'completed'
                              ? 'border-green-600 bg-green-500 text-white' + (isViewed ? ' ring-green-300' : '')
                              : state === 'active' && isViewed
                                ? 'border-primary ring-primary/30 bg-primary/5 text-primary'
                                : state === 'active'
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : state === 'past-due'
                                    ? 'border-red-500 bg-red-50 text-red-600' + (isViewed ? ' ring-red-200' : '')
                                    : 'border-gray-300 bg-gray-50 text-muted-foreground' + (isViewed ? ' ring-gray-200' : '')
                          }`}
                          title={`Task ${index + 1}: ${m.name}${state === 'completed' ? ' (Completed)' : state === 'past-due' ? ' (Past-due)' : state === 'active' ? ' (Active)' : state === 'inactive' ? ' (Inactive)' : ''}`}
                        >
                          {index + 1}
                        </button>
                        {index < project.milestones.length - 1 && (
                          <div className="flex-1 h-0.5 bg-gray-200 min-w-[8px] mx-1" />
                        )}
                      </div>
                    )
                  })}
                </div>
                <Trophy className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-yellow-50/80 border border-yellow-200/80 text-xs text-yellow-900">
              <span className="flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-green-600 bg-green-500 text-white font-semibold text-[10px]">1</span> Completed: green</span>
              <span className="flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-red-500 bg-red-50 text-red-600 font-semibold text-xs">2</span> Past-due: red</span>
              <span className="flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary bg-primary/5 text-primary font-semibold text-xs">3</span> Active: blue border</span>
              <span className="flex items-center gap-2"><span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-50 text-muted-foreground font-semibold text-xs">4</span> Inactive: click to view</span>
            </div>

            {/* Checkpoint card for selected milestone */}
            {viewedMilestoneId && (() => {
              const m = project.milestones.find((mil) => mil.id === viewedMilestoneId)
              if (!m) return null
              const index = project.milestones.indexOf(m)
              const isSelected = selectedMilestone === m.id
              const hasEvidenceForCheckpoint = evidence.some((ev) => ev.milestoneId === m.id)
              const assessment = assessmentResults[m.id]
              const isNotOpenYet = m.opensOn && new Date(m.opensOn) > new Date()
              const checkpointState = getMilestoneState(m)
              const statusLabel =
                checkpointState === 'completed'
                  ? 'Task completed'
                  : checkpointState === 'inactive'
                    ? 'Inactive Task'
                    : checkpointState === 'past-due'
                      ? 'Past due'
                      : 'Active'
              const statusBadgeClass =
                checkpointState === 'completed'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : checkpointState === 'inactive'
                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                    : checkpointState === 'past-due'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
              return (
                <Card className="rounded-xl border-gray-200 bg-stone-50/50">
                  <CardContent className="pt-6 space-y-5">
                              {/* Status badge */}
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${statusBadgeClass}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>
                              {/* Checkpoint details header */}
                              <div className="rounded-lg bg-gray-200/80 border border-gray-200/80 p-4 space-y-3">
                                <h3 className="text-lg font-bold text-foreground">Task {index + 1}</h3>
                                {(hasEvidenceForCheckpoint || isNotOpenYet) ? (
                                  <>
                                    <div>
                                      <p className="text-xs font-bold text-foreground mb-1">Topic</p>
                                      <p className="text-sm font-normal text-foreground">{m.name}</p>
                                    </div>
                                    {m.objectives && (
                                      <div>
                                        <p className="text-xs font-bold text-foreground mb-1">Objectives</p>
                                        <p className="text-sm font-normal text-foreground whitespace-pre-line">{m.objectives}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs font-bold text-foreground mb-1">Tasks</p>
                                      <p className="text-sm font-normal text-foreground whitespace-pre-line">{m.description}</p>
                                    </div>
                                    {!isNotOpenYet && (
                                      <div>
                                        <p className="text-xs font-bold text-foreground mb-1">Required Evidence</p>
                                        <p className="text-sm font-normal text-foreground">
                                          {assessment ? 'Share your feedback for your project.' : 'Take the self-assessment to show your understanding of key concepts.'}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <p className="text-xs font-bold text-foreground mb-1">Topic</p>
                                      <p className="text-sm font-normal text-foreground">{m.name}</p>
                                    </div>
                                    {m.objectives && (
                                      <div>
                                        <p className="text-xs font-bold text-foreground mb-1">Objectives</p>
                                        <p className="text-sm font-normal text-foreground whitespace-pre-line">{m.objectives}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs font-bold text-foreground mb-1">Tasks</p>
                                      <p className="text-sm font-normal text-foreground whitespace-pre-line">{m.description}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-foreground mb-1">Required Evidence</p>
                                      <p className="text-sm font-normal text-foreground">
                                        Upload resources and complete the assessment to show your learning progression.
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* State: Task not open yet */}
                              {isNotOpenYet && (
                                <div className="py-12 text-center space-y-3">
                                  <p className="text-sm text-muted-foreground">
                                    Check back on <span className="font-semibold text-foreground">
                                      {m.opensOn ? new Date(m.opensOn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                    </span> to start the task!
                                  </p>
                                  <span className="text-2xl" role="img" aria-label="Smiling">😊</span>
                                </div>
                              )}

                              {/* State: No evidence — dashed gallery, Add evidence */}
                              {!isNotOpenYet && !hasEvidenceForCheckpoint && (
                                <div>
                                  <p className="text-sm font-bold text-foreground mb-3">Evidence Gallery</p>
                                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center space-y-4">
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Add your learning evidence.</p>
                                      <p className="text-sm text-muted-foreground">See how it aligns with the next activity.</p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      className="border-gray-300 bg-white hover:bg-gray-50"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedMilestone(m.id)
                                        setSubmitStep(2)
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add evidence
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* State: Evidence added, no assessment — Take Assessment + Gallery + Matching Criterion + Add More */}
                              {!isNotOpenYet && hasEvidenceForCheckpoint && !assessment && (
                                <>
                                  <Card className="border-stone-200 bg-stone-50/80">
                                    <CardHeader className="pb-2">
                                      <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">Assessment Analysis</CardTitle>
                                        <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                  </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <p className="text-sm text-muted-foreground">
                                        Think you&apos;ve got all your evidence uploaded? Take a quick assessment to check your understanding.
                                      </p>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="border border-gray-200"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedMilestone(m.id)
                                          setSubmitStep(4)
                                          setAssessmentStarted(false)
                                          setAssessmentAnswers({})
                                          setAssessmentSubmitted(false)
                                        }}
                                      >
                                        <ClipboardList className="h-4 w-4 mr-2" />
                                        Take Assessment
                                      </Button>
                </CardContent>
              </Card>
                                  <div>
                                    <p className="text-sm font-bold text-foreground mb-3">Evidence Gallery</p>
                                    <div className="flex items-center gap-2">
                                      <Button type="button" variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); checkpointCarouselRef.current?.scrollBy({ left: -200, behavior: 'smooth' }) }}>
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div ref={checkpointCarouselRef} className="flex gap-3 overflow-x-auto flex-1 py-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                                        {(() => {
                                          const forCheckpoint = evidence.filter((ev) => ev.milestoneId === m.id)
                                          if (forCheckpoint.length === 0) {
                                            return [1, 2, 3, 4, 5].map((i) => (
                                              <div key={i} className="shrink-0 w-32 rounded-lg border border-gray-200 p-3 flex flex-col gap-1 bg-gray-100">
                                                <div className="aspect-[4/3] rounded bg-gray-100" />
                                                <p className="text-[11px] text-muted-foreground">—</p>
                                              </div>
                                            ))
                                          }
                                          const sortedByDate = [...forCheckpoint].sort(
                                            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                                          )
                                          const latestId = sortedByDate[0]?.id
                                          return forCheckpoint.map((ev) => {
                                            const selected = selectedEvidenceIdByCheckpoint[m.id] === ev.id || (!selectedEvidenceIdByCheckpoint[m.id] && ev.id === latestId)
                                            const isPdf = ev.fileType === 'pdf' || ev.fileName || ev.content?.startsWith('PDF:')
                                            const isArticle = ev.content?.startsWith('Article:')
                                            const displayLabel = isPdf ? 'PDF' : isArticle ? 'Article' : 'Written'
                                            const displayName = ev.fileName || (isPdf && ev.content?.replace(/^PDF:\s*/, '')) || (isArticle ? ev.content.replace(/^Article:\s*/, '').replace(/^https?:\/\//, '').slice(0, 30) + '…' : ev.content?.slice(0, 30) + (ev.content?.length > 30 ? '…' : ''))
                                            return (
                                              <div key={ev.id} onClick={(e) => { e.stopPropagation(); setSelectedEvidenceIdByCheckpoint(prev => ({ ...prev, [m.id]: ev.id })) } } className={`shrink-0 w-32 rounded-lg border p-3 flex flex-col gap-1 cursor-pointer ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                                                <div className="aspect-[4/3] rounded bg-muted flex items-center justify-center">{isPdf || displayLabel === 'Written' ? <FileText className="h-8 w-8 text-muted-foreground" /> : <Link2 className="h-8 w-8 text-muted-foreground" />}</div>
                                                <Badge variant="outline" className="text-[10px] w-fit">{displayLabel}</Badge>
                                                <p className="text-[11px] text-muted-foreground truncate" title={displayName}>{displayName}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(ev.submittedAt).toLocaleDateString()}</p>
                                              </div>
                                            )
                                          })
                                        })()}
                                      </div>
                                      <Button type="button" variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); checkpointCarouselRef.current?.scrollBy({ left: 200, behavior: 'smooth' }) }}>
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-foreground">Matching Criterion</p>
                                      <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                                    </div>
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                      Note: This article may not be suitable for demonstrating all rubric criteria. Consider submitting additional articles or resources to cover the remaining criteria.
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
                                        <div>
                                          <p className="font-medium text-sm">Argument Development</p>
                                          <p className="text-xs text-muted-foreground">Quality of claim, counterclaims, and reasoning</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Strong Match</Badge>
                                      </div>
                                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
                                        <div>
                                          <p className="font-medium text-sm">Argument Development</p>
                                          <p className="text-xs text-muted-foreground">Quality of claim, counterclaims, and reasoning</p>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Partial Match</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-center">
                                    <Button variant="outline" className="border-gray-300 bg-white hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); setSelectedMilestone(m.id); setSubmitStep(2) }}>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Add More Learning Evidence
                                    </Button>
                                  </div>
                                </>
                              )}

                              {/* State: Evidence added and assessment taken — Current Submission/Retake + Gallery + Matching Criterion + Add More */}
                              {!isNotOpenYet && hasEvidenceForCheckpoint && assessment && (
                                <>
                                  <Card className="border-stone-200 bg-stone-50/80">
                                    <CardHeader className="pb-2">
                                      <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">Assessment Analysis</CardTitle>
                                        <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                                      </div>
              </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Current Submission</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                                          <p className="text-sm font-semibold text-foreground">
                                            {assessment?.levelLabel ?? 'Beginning'} ({assessment?.score ?? 1})
                                          </p>
                                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                                          {assessment?.note ?? 'Failed to demonstrate thinking and reasoning, only provided online resources'}
                                        </p>
                                      </div>
                                      <div className="rounded-lg border border-gray-200 bg-gray-100 min-h-[120px]" aria-hidden />
                                      <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-5 text-center space-y-3">
                                        <div>
                                          <p className="text-base font-medium text-foreground">Want to try again?</p>
                                          <p className="text-sm text-muted-foreground">
                                            Retake the assessment to check your understanding again.
                        </p>
                      </div>
                                        <Button
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedMilestone(m.id)
                                            setSubmitStep(4)
                                            setAssessmentStarted(false)
                                            setAssessmentAnswers({})
                                            setAssessmentSubmitted(false)
                                          }}
                                        >
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Retake Assessment
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <div>
                                    <p className="text-sm font-bold text-foreground mb-3">Evidence Gallery</p>
                                    <div className="flex items-center gap-2">
                                      <Button type="button" variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); checkpointCarouselRef.current?.scrollBy({ left: -200, behavior: 'smooth' }) }}>
                                        <ChevronLeft className="h-4 w-4" />
                                      </Button>
                                      <div ref={checkpointCarouselRef} className="flex gap-3 overflow-x-auto flex-1 py-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                                        {(() => {
                                          const forCheckpoint = evidence.filter((ev) => ev.milestoneId === m.id)
                                          if (forCheckpoint.length === 0) {
                                            return [1, 2, 3, 4].map((i) => (
                                              <div key={i} className="shrink-0 w-32 rounded-lg border border-gray-200 p-3 flex flex-col gap-1 bg-gray-100">
                                                <div className="aspect-[4/3] rounded bg-gray-100" />
                                                <p className="text-[11px] text-muted-foreground">—</p>
                                              </div>
                                            ))
                                          }
                                          const sortedByDate = [...forCheckpoint].sort(
                                            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                                          )
                                          const latestId = sortedByDate[0]?.id
                                          return forCheckpoint.map((ev) => {
                                            const selected = selectedEvidenceIdByCheckpoint[m.id] === ev.id || (!selectedEvidenceIdByCheckpoint[m.id] && ev.id === latestId)
                                            const isPdf = ev.fileType === 'pdf' || ev.fileName || ev.content?.startsWith('PDF:')
                                            const isArticle = ev.content?.startsWith('Article:')
                                            const displayLabel = isPdf ? 'PDF' : isArticle ? 'Article' : 'Written'
                                            const displayName = ev.fileName || (isPdf && ev.content?.replace(/^PDF:\s*/, '')) || (isArticle ? ev.content.replace(/^Article:\s*/, '').replace(/^https?:\/\//, '').slice(0, 30) + '…' : ev.content?.slice(0, 30) + (ev.content?.length > 30 ? '…' : ''))
                                            return (
                                              <div key={ev.id} onClick={(e) => { e.stopPropagation(); setSelectedEvidenceIdByCheckpoint(prev => ({ ...prev, [m.id]: ev.id })) } } className={`shrink-0 w-32 rounded-lg border p-3 flex flex-col gap-1 cursor-pointer ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                                                <div className="aspect-[4/3] rounded bg-muted flex items-center justify-center">{isPdf || displayLabel === 'Written' ? <FileText className="h-8 w-8 text-muted-foreground" /> : <Link2 className="h-8 w-8 text-muted-foreground" />}</div>
                                                <Badge variant="outline" className="text-[10px] w-fit">{displayLabel}</Badge>
                                                <p className="text-[11px] text-muted-foreground truncate" title={displayName}>{displayName}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(ev.submittedAt).toLocaleDateString()}</p>
                    </div>
                  )
                                          })
                                        })()}
                                      </div>
                                      <Button type="button" variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); checkpointCarouselRef.current?.scrollBy({ left: 200, behavior: 'smooth' }) }}>
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-foreground">Matching Criterion</p>
                                      <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
                                        <div>
                                          <p className="font-medium text-sm">Argument Development</p>
                                          <p className="text-xs text-muted-foreground">Quality of claim, counterclaims, and reasoning</p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Strong Match</Badge>
                                      </div>
                                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
                                        <div>
                                          <p className="font-medium text-sm">Argument Development</p>
                                          <p className="text-xs text-muted-foreground">Quality of claim, counterclaims, and reasoning</p>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Partial Match</Badge>
                                      </div>
                                      <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
                                        <div>
                                          <p className="font-medium text-sm">Argument Development</p>
                                          <p className="text-xs text-muted-foreground">Quality of claim, counterclaims, and reasoning</p>
                                        </div>
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">Not Covered</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-center">
                                    <Button variant="outline" className="border-gray-300 bg-white hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); setSelectedMilestone(m.id); setSubmitStep(2) }}>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Add More Learning Evidence
                                    </Button>
                                  </div>
                                </>
                              )}
              </CardContent>
            </Card>
              )
            })()}
          </>
        )}

        {/* Stepper for steps 2–4 */}
        {submitStep > 1 && (
          <div className="flex flex-wrap gap-4">
            {[
              { id: 1, label: 'Choose task' },
              { id: 2, label: 'Evidence & rubric' },
              { id: 3, label: 'Evidence Gallery' },
              { id: 4, label: 'Assessment' },
            ].map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                    submitStep === step.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-background text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <span className={`text-xs ${submitStep === step.id ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Evidence Hub — Article URL / Upload PDF tabs + Assessment Rubric (separate sections) */}
        {submitStep === 2 && (
              <div className="space-y-6">
                {selectedMilestone && (
                  <p className="text-sm text-muted-foreground">
                    Evidence Hub · Upload Learning Evidence · Task {project.milestones.findIndex((m) => m.id === selectedMilestone) + 1}
                  </p>
                )}

                {/* Upload Learning Evidence — tabs: Article URL | Upload PDF */}
            <Card>
              <CardHeader>
                    <CardTitle>Upload Learning Evidence</CardTitle>
                    <CardDescription>
                      {selectedMilestone
                        ? `Submitting for Task ${project.milestones.findIndex((m) => m.id === selectedMilestone) + 1}. Add at least one: article URL or PDF. Review the rubric for reference, then click Submit evidence.`
                        : 'Select a task in Step 1 first.'}
                    </CardDescription>
                    {selectedMilestone && !articleMatches && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
                        At least one is required: submit an article URL or upload a PDF before you can continue.
                      </p>
                    )}
              </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs value={evidenceInputTab} onValueChange={(v) => setEvidenceInputTab(v as 'article-url' | 'upload-pdf')} className="w-full">
                      <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <TabsTrigger value="article-url" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200">
                          Article URL
                        </TabsTrigger>
                        <TabsTrigger value="upload-pdf" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200">
                          Upload PDF
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="article-url" className="mt-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">Submit Online Article URL</h3>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="article-url"
                                placeholder="https://example.com/article"
                                className="pl-9 bg-white border-gray-200 text-sm"
                                value={articleUrl}
                                onChange={(e) => setArticleUrl(e.target.value)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              className="shrink-0 border border-gray-200"
                              onClick={handleAnalyzeArticle}
                              disabled={!articleUrl.trim()}
                            >
                              Submit Article
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 max-w-xl">
                            Paste the URL of an online article. The AI will analyze it and identify which rubric criteria it can help you demonstrate.
                          </p>
                        </div>
                        {articleMatches && articleUrl && (
                          <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm text-green-800">
                            Article submitted. You'll see how it matches the rubric after submitting below.
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="upload-pdf" className="mt-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">Upload PDF</h3>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Button
                            variant="outline"
                            type="button"
                            className="border-gray-200"
                            onClick={handleUploadClick}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose PDF file
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Upload a PDF document. The AI will analyze it and map it to the rubric criteria below.
                          </p>
                        </div>
                        {uploadedFile && (
                          <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">PDF attached</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={handleAnalyzeArticle}
                              >
                                Submit PDF
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
                                  Open
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}
                        {articleMatches && uploadedFile && (
                          <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm text-green-800">
                            PDF submitted. You'll see how it matches the rubric after submitting below.
                  </div>
                        )}
                      </TabsContent>
                    </Tabs>
              </CardContent>
            </Card>

                {/* Assessment Rubric — for reference only; no submitted article match status here */}
            <Card>
              <CardHeader>
                    <CardTitle>Assessment Rubric</CardTitle>
                    <CardDescription>For reference only. Criteria and levels for this project.</CardDescription>
              </CardHeader>
                  <CardContent className="space-y-6">
                    {rubricCategories.map((cat) => (
                        <div key={cat.title} className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{cat.title}</p>
                            <p className="text-xs text-muted-foreground">{cat.subtitle}</p>
                          </div>
                          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {[4, 3, 2, 1].map((score, idx) => {
                              const bg =
                                score === 4
                                  ? 'bg-green-50 border-green-200 text-green-900'
                                  : score === 3
                                    ? 'bg-sky-50 border-sky-200 text-sky-900'
                                    : score === 2
                                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                                      : 'bg-red-50 border-red-200 text-red-900'
                              return (
                                <div
                                  key={score}
                                  className={`rounded-lg border p-3 text-xs ${bg}`}
                                >
                                  <p className="font-semibold mb-1">Level {score}</p>
                                  <p className="leading-snug opacity-90">{cat.levels[idx]}</p>
                                </div>
                              )
                            })}
                          </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <Button variant="outline" onClick={() => setSubmitStep(1)}>
                    Back
                  </Button>
                  <div className="flex flex-col gap-1 items-end">
                    {!articleUrl.trim() && !uploadedFile && (
                      <p className="text-xs text-muted-foreground">Add an article URL or PDF to continue</p>
                    )}
                    <Button
                      onClick={() => handleSubmit({ goToEvidenceGallery: true })}
                      disabled={(!articleUrl.trim() && !uploadedFile) || submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit evidence'}
                    </Button>
                  </div>
                    </div>
                  </div>
                )}

            {/* Step 3: Evidence Gallery — shown after Submit evidence */}
            {submitStep === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Evidence Hub · Upload Learning Evidence · Evidence Gallery
                </p>

                {/* Your upload has been matched! — light beige card */}
                {(articleUrl.trim() || uploadedFile) && (
                  <Card className="border-stone-200 bg-stone-50/80">
                    <CardHeader>
                      <CardTitle>Your upload has been matched!</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
                        <div className="rounded-lg border border-stone-200 bg-white/80 aspect-[4/3] flex items-center justify-center min-h-[200px]">
                          {uploadedFile ? (
                            <div className="p-4 text-center">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm font-medium truncate max-w-[220px] mx-auto">{uploadedFile.name}</p>
                              <Button variant="outline" size="sm" className="mt-2" asChild>
                                <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
                                  Open PDF
                                </a>
                              </Button>
                            </div>
                          ) : articleUrl ? (
                            <div className="p-4 text-center">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground line-clamp-2 max-w-[240px]">{articleUrl}</p>
                              <p className="text-[11px] text-muted-foreground mt-1">Article URL</p>
                            </div>
                          ) : null}
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">Matching Criterion</p>
                            <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Note: This article may not be suitable for demonstrating all rubric criteria. Consider submitting additional articles or resources to cover the remaining criteria.
                          </p>
                          {(articleMatches?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                              {articleMatches?.map((m, idx) => (
                                <div
                                  key={`${m.criterion}-${idx}`}
                                  className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3"
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm">{m.criterion}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {m.description ?? 'Quality of alignment'}
                                    </p>
                                  </div>
                                  <Badge
                                    className={
                                      m.strength === 'strong'
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }
                                  >
                                    {m.strength === 'strong' ? 'Strong Match' : 'Partial Match'}
                                  </Badge>
                                </div>
                              ))}
                </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Your evidence will be matched to rubric criteria.</p>
                )}
                <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSubmitStep(2)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                            Add More Learning Evidence
                </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Evidence Gallery carousel — light beige card */}
                <Card className="border-stone-200 bg-stone-50/80">
                  <CardHeader>
                    <CardTitle>Evidence Gallery</CardTitle>
                    <CardDescription>
                      Your learning evidence for this task.
                    </CardDescription>
                    </CardHeader>
                  <CardContent>
                    {selectedMilestone && (() => {
                      const forCheckpoint = evidence.filter((ev) => ev.milestoneId === selectedMilestone)
                      const checkpointNum = project.milestones.findIndex((m) => m.id === selectedMilestone) + 1
                      if (forCheckpoint.length === 0) {
                        return (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9" disabled>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-3 overflow-x-auto flex-1 py-2">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="shrink-0 w-36 h-28 rounded-lg border border-dashed border-stone-300 bg-white/60"
                                />
                              ))}
                            </div>
                            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9" disabled>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      }
                      return (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {forCheckpoint.map((ev) => {
                            const feedbacks = getFeedbackByEvidence(ev.id)
                            const avgScore = feedbacks.length > 0
                              ? (feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length).toFixed(1)
                              : '—'
                            const isPdf = ev.fileType === 'pdf' || ev.fileName || ev.content?.startsWith('PDF:')
                            const isArticle = ev.content?.startsWith('Article:')
                            const displayLabel = isPdf ? 'PDF' : isArticle ? 'Article' : 'Written'
                            const displayName = ev.fileName || (isPdf && ev.content?.replace(/^PDF:\s*/, '')) || (isArticle ? ev.content.replace(/^Article:\s*/, '').replace(/^https?:\/\//, '').slice(0, 40) + '…' : ev.content?.slice(0, 40) + (ev.content?.length > 40 ? '…' : ''))
                            return (
                              <div
                                key={ev.id}
                                className="shrink-0 w-48 rounded-lg border bg-card p-4 flex flex-col gap-2"
                              >
                                <div className="aspect-[4/3] rounded bg-muted flex items-center justify-center">
                                  {isPdf || displayLabel === 'Written' ? <FileText className="h-10 w-10 text-muted-foreground" /> : <Link2 className="h-10 w-10 text-muted-foreground" />}
                                </div>
                                <Badge variant="outline" className="text-[10px] w-fit">{displayLabel}</Badge>
                                <p className="text-xs font-medium">Task {checkpointNum}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(ev.submittedAt).toLocaleDateString()} · {avgScore}/4
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2 flex-1" title={ev.content}>{displayName}</p>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Footer: Done with this task | Take assessment (optional) */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setSubmitStep(1)
                      setArticleUrl('')
                      setUploadedFile(null)
                      setArticleMatches(null)
                      setSelectedMilestone('')
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Done with this task
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto border border-gray-200"
                    onClick={() => setSubmitStep(4)}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Take assessment (optional)
                  </Button>
                </div>
                              </div>
                            )}
                            
            {/* Step 4: Assessment — questions and answers */}
            {submitStep === 4 && (
              <Card className="border-stone-200 bg-stone-50/80">
                <CardHeader>
                  <CardTitle>Assessment</CardTitle>
                  <CardDescription>Check your understanding after uploading evidence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Think you&apos;ve got all your evidence uploaded? Take a quick assessment to check your understanding.
                  </p>

                  {!assessmentStarted ? (
                    <div className="rounded-lg border border-stone-200 bg-white p-6 text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Answer a few questions about your evidence and understanding. Start the assessment when you&apos;re ready.
                      </p>
                      <Button
                        variant="default"
                        onClick={() => setAssessmentStarted(true)}
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Start assessment
                      </Button>
                    </div>
                  ) : assessmentSubmitted ? (
                    (() => {
                      const forTask = selectedMilestone ? evidence.filter((ev) => ev.milestoneId === selectedMilestone) : []
                      const latestEv = [...forTask].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0]
                      const aiFeedbacks = latestEv ? getFeedbackByEvidence(latestEv.id) : []
                      const avgScore = aiFeedbacks.length > 0 ? aiFeedbacks.reduce((s, f) => s + f.score, 0) / aiFeedbacks.length : (assessmentResults[selectedMilestone!]?.score ?? 1)
                      const levelLabel = assessmentResults[selectedMilestone!]?.levelLabel ?? (avgScore >= 3.5 ? 'Advanced' : avgScore >= 2.5 ? 'Proficient' : avgScore >= 1.5 ? 'Developing' : 'Beginning')
                      const displayScore = Math.round(avgScore)
                      const note = assessmentResults[selectedMilestone!]?.note ?? (aiFeedbacks.length > 0 ? `Overall performance: ${avgScore.toFixed(1)}/4 across rubric criteria.` : '')
                      const mapCriterionToRubric = (criterionId: string) => {
                        const idx = parseInt(criterionId.replace(/\D/g, ''), 10) - 1
                        return rubricCategories[Math.max(0, Math.min(idx, rubricCategories.length - 1))]
                      }
                      return (
                        <div className="space-y-6">
                          {/* Breadcrumb */}
                          <p className="text-xs text-muted-foreground">
                            Evidence Hub · Take Assessment · <span className="font-medium text-foreground">Assessment Result</span>
                          </p>
                          {/* Project info */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">{project?.title}</span>
                            {classNamesForProject[0] && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">{classNamesForProject[0]}</Badge>
                            )}
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">{subjectTag}</Badge>
                          </div>
                          {/* Assessment Analysis */}
                          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
                              <h3 className="font-semibold text-foreground">Assessment Analysis</h3>
                              <Badge variant="secondary" className="text-[10px]">AI Generated</Badge>
                            </div>
                            <div className="grid gap-4 md:grid-cols-[1fr,1fr] p-4">
                              {/* Left: Current Submission */}
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Current Submission</p>
                                <div className="rounded-lg border border-gray-200 bg-gray-100 min-h-[200px] p-4">
                                  {latestEv ? (
                                    <div className="text-sm text-foreground space-y-2">
                                      <p className="line-clamp-6">{latestEv.content}</p>
                                      <p className="text-xs text-muted-foreground">{new Date(latestEv.submittedAt).toLocaleDateString()}</p>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No submission to display.</p>
                                  )}
                                </div>
                              </div>
                              {/* Right: Overall result */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      displayScore >= 3 ? 'bg-green-500' : displayScore >= 2 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    aria-hidden
                                  />
                                  <p className="text-sm font-semibold text-foreground">
                                    {levelLabel} ({displayScore})
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">{note}</p>
                              </div>
                            </div>
                            {/* Rubric breakdown */}
                            <div className="border-t p-4 space-y-4">
                              {(aiFeedbacks.length > 0
                                ? aiFeedbacks
                                : rubricCategories.map((_, i) => ({ criterionId: `c${i + 1}`, score: displayScore }))
                              ).map((fb: { criterionId: string; score: number }) => {
                                const rubric = mapCriterionToRubric(fb.criterionId)
                                if (!rubric) return null
                                return (
                                  <div key={fb.criterionId} className="space-y-2">
                                    <p className="font-medium text-sm">{rubric.title}</p>
                                    <p className="text-xs text-muted-foreground">{rubric.subtitle}</p>
                                    <div className="grid grid-cols-4 gap-2">
                                      {[4, 3, 2, 1].map((levelScore, idx) => {
                                        const isAchieved = fb.score === levelScore
                                        const levelColors: Record<number, { bg: string; border: string; text: string }> = {
                                          4: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
                                          3: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-900' },
                                          2: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
                                          1: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
                                        }
                                        const c = levelColors[levelScore]
                                        const achievedRing = isAchieved ? ' ring-2 ring-offset-1 ring-gray-800' : ''
                                        return (
                                          <div key={levelScore} className={`rounded-lg border p-3 text-xs ${c.bg} ${c.border}${achievedRing}`}>
                                            <p className={`font-semibold mb-1 ${c.text}`}>{levelScore}</p>
                                            <p className={`leading-snug ${isAchieved ? c.text : 'text-muted-foreground'}`}>{rubric.levels[3 - idx]}</p>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-3 p-4 border-t bg-gray-50">
                              <Button
                                variant="outline"
                                onClick={() => { setSubmitStep(1); setAssessmentStarted(false); setAssessmentAnswers({}); setAssessmentSubmitted(false) }}
                              >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                I&apos;m Happy with the Result
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => { setAssessmentStarted(false); setAssessmentAnswers({}); setAssessmentSubmitted(false) }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retake Assessment
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="rounded-lg border border-stone-200 bg-white p-6 space-y-6">
                      <p className="text-sm text-muted-foreground">Answer the following questions. Format depends on the assignment—for this demo, use the text fields below.</p>
                      {assessmentQuestions.map((q) => (
                        <div key={q.id} className="space-y-2">
                          <Label htmlFor={q.id} className="text-sm font-medium">{q.question}</Label>
                          <Textarea
                            id={q.id}
                            placeholder={q.placeholder}
                            value={assessmentAnswers[q.id] ?? ''}
                            onChange={(e) => setAssessmentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            className="min-h-[80px] resize-none"
                            rows={3}
                          />
                        </div>
                      ))}
                      <Button
                        variant="default"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          if (!selectedMilestone) return
                          const answered = assessmentQuestions.filter((q) => !!assessmentAnswers[q.id]?.trim()).length
                          const score = Math.max(1, Math.min(4, answered)) // demo: 1-4 based on how many questions answered
                          const levelLabel = score === 4 ? 'Advanced' : score === 3 ? 'Proficient' : score === 2 ? 'Developing' : 'Beginning'
                          const note =
                            score <= 1
                              ? 'Failed to demonstrate thinking and reasoning. Only provided online resources.'
                              : score === 2
                                ? 'Some understanding shown, but key reasoning is missing or unclear.'
                                : score === 3
                                  ? 'Solid understanding shown with mostly clear reasoning and evidence.'
                                  : 'Strong understanding with clear reasoning and strong evidence.'
                          const next = { ...assessmentResults, [selectedMilestone]: { levelLabel, score, note } }
                          setAssessmentResults(next)
                          persistAssessmentResults(next)
                          setAssessmentSubmitted(true)
                        }}
                      >
                        Submit assessment
                      </Button>
                              </div>
                            )}

                  {!assessmentSubmitted && (
                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitStep(3)
                          setAssessmentStarted(false)
                          setAssessmentAnswers({})
                          setAssessmentSubmitted(false)
                        }}
                      >
                        Back to Evidence Gallery
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSubmitStep(1)
                          setAssessmentStarted(false)
                          setAssessmentAnswers({})
                          setAssessmentSubmitted(false)
                        }}
                      >
                        Done for now
                      </Button>
                          </div>
                  )}
                    </CardContent>
                  </Card>
            )}
      </main>
    </div>
  )
}

export default function StudentProject() {
  return (
    <AuthGuard requiredRole="student">
      <StudentProjectContent />
    </AuthGuard>
  )
}
