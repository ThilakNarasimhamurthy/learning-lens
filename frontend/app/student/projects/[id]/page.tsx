"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser } from '@/lib/auth'
import { getProject, submitEvidence, getEvidenceByStudent, getFeedbackByEvidence, getStudentProgress } from '@/lib/data-store'
import { dedupeById } from '@/lib/utils'
import type { Project, Evidence, Feedback } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Upload, CheckCircle, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AIProcessSteps, AIUsageStats } from '@/components/ai-indicator'
import { demoAIStats } from '@/lib/demo-data'

const rubricCategories = [
  {
    title: 'Argument Development',
    subtitle: 'Quality of claim, counterclaims, and reasoning',
    levels: [
      'Clear, compelling claim with sophisticated counterclaims and well-developed reasoning throughout',
      'Clear claim with relevant counterclaims and adequate reasoning',
      'Claim present but counterclaims or reasoning may be weak or unclear',
      'Unclear or missing claim, insufficient counterclaims and reasoning',
    ],
  },
  {
    title: 'Evidence & Support',
    subtitle: 'Use of credible sources and textual evidence',
    levels: [
      'Multiple credible sources integrated seamlessly with strong, relevant evidence',
      'Adequate credible sources with relevant evidence to support claims',
      'Limited sources or evidence; relevance may be unclear',
      'Insufficient or non-credible sources; little to no evidence',
    ],
  },
  {
    title: 'Organization & Structure',
    subtitle: 'Logical flow and essay structure',
    levels: [
      'Sophisticated organization with smooth transitions and clear progression of ideas',
      'Clear organization with logical flow and adequate transitions',
      'Basic organization present but may lack clear transitions or logical flow',
      'Weak or confusing organization with little logical progression',
    ],
  },
  {
    title: 'Language & Conventions',
    subtitle: 'Grammar, vocabulary, and writing mechanics',
    levels: [
      'Sophisticated vocabulary with virtually no errors in grammar, spelling, or punctuation',
      'Appropriate vocabulary with few errors that do not impede understanding',
      'Basic vocabulary with several errors that may affect clarity',
      'Limited vocabulary with frequent errors that impede understanding',
    ],
  },
]

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
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'gallery' | 'feedback'>('overview')
  const [galleryCheckpointId, setGalleryCheckpointId] = useState<string | null>(null)
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null)
  const [expandedEvidenceIdInList, setExpandedEvidenceIdInList] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      if (proj.milestones.length > 0 && galleryCheckpointId === null) {
        setGalleryCheckpointId(proj.milestones[0].id)
      }
    }
  }, [params.id, user])

  const handleSubmit = async () => {
    if (!user || !project || !selectedMilestone || !content) return
    
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
        content,
        reflection,
        fileName: uploadedFile?.name,
        fileUrl: uploadedFile?.url,
        fileType: uploadedFile ? 'pdf' : undefined,
      })
      
      // Refresh evidence from localStorage
      const updated = dedupeById(getEvidenceByStudent(user.id, project.id))
      setEvidence(updated)
      setActiveEvidenceId(newEvidence.id)
      setActiveTab('feedback')
      setSubmitStep(1)
      setContent('')
      setReflection('')
      setSelectedMilestone('')
      setUploadedFile(null)
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

  const progress = user ? getStudentProgress(user.id, project.id) : null
  const completedMilestones = progress?.completedMilestones || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mt-2">{project.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submit">Submit Work</TabsTrigger>
            <TabsTrigger value="gallery">Evidence Gallery</TabsTrigger>
            <TabsTrigger value="feedback">My Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>

            {project.attachments && project.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Images & documents</CardTitle>
                  <CardDescription>Resources related to this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {project.attachments.map(att => (
                      <div key={att.id} className="border rounded-lg overflow-hidden bg-gray-50">
                        {att.type === 'image' && att.url ? (
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={att.url} alt={att.name} className="h-24 w-auto max-w-[200px] object-cover" />
                          </a>
                        ) : (
                          <a
                            href={att.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-3 min-w-[140px] ${att.url ? 'text-primary hover:underline' : 'cursor-default pointer-events-none'}`}
                          >
                            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                            <span className="text-sm truncate">{att.name}</span>
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground px-2 py-1 truncate max-w-[200px]">{att.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.milestones.map(m => {
                  const isCompleted = completedMilestones.includes(m.id)
                  return (
                    <div key={m.id} className="flex items-start gap-3 p-3 border rounded">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {isCompleted && <Badge variant="outline">Completed</Badge>}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rubric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.rubric.map(criterion => (
                  <div key={criterion.id} className="p-3 border rounded">
                    <p className="font-medium text-sm">{criterion.name}</p>
                    <p className="text-xs text-muted-foreground">{criterion.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            {/* Stepper */}
            <div className="flex flex-wrap gap-4">
              {[
                { id: 1, label: 'Choose checkpoint' },
                { id: 2, label: 'Evidence & rubric' },
                { id: 3, label: 'Add your work' },
                { id: 4, label: 'Review & submit' },
              ].map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                      submitStep === step.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-xs ${
                      submitStep === step.id ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Choose checkpoint only — click goes to Step 2 (evidence) */}
            {submitStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1 · Choose checkpoint</CardTitle>
                  <CardDescription>Select a checkpoint to submit evidence for. You’ll add your evidence in the next step.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {project.milestones.map((m, index) => (
                      <div
                        key={m.id}
                        role="button"
                        tabIndex={0}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMilestone === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedMilestone(m.id)
                          setSubmitStep(2)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedMilestone(m.id)
                            setSubmitStep(2)
                          }
                        }}
                      >
                        <p className="font-semibold text-sm">Checkpoint {index + 1}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Due: {new Date(m.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Evidence — article URL, PDF, Analyze, Rubric overview (image content) */}
            {submitStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2 · Evidence & rubric</CardTitle>
                  <CardDescription>
                    {selectedMilestone
                      ? `Submitting for Checkpoint ${project.milestones.findIndex((m) => m.id === selectedMilestone) + 1}. Add optional evidence and review the rubric.`
                      : 'Select a checkpoint in Step 1 first.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedMilestone && (
                    <div className="p-2 rounded-md bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium">
                        Selected: Checkpoint {project.milestones.findIndex((m) => m.id === selectedMilestone) + 1}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="article-url">Optional: Article URL</Label>
                    <div className="flex flex-col gap-3 md:flex-row">
                      <Input
                        id="article-url"
                        placeholder="Paste an article URL that supports your work"
                        className="flex-1 bg-white text-sm"
                        value={articleUrl}
                        onChange={(e) => setArticleUrl(e.target.value)}
                      />
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
                        className="whitespace-nowrap"
                        onClick={handleUploadClick}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload PDF
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAnalyzeArticle}
                        disabled={!articleUrl.trim() && !uploadedFile}
                      >
                        Analyze article (demo)
                      </Button>
                    </div>
                    <p className="max-w-xl text-xs text-muted-foreground">
                      AI uses your article to look for connections to the rubric. This demo simulates those matches locally.
                    </p>
                  </div>

                  {uploadedFile && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Attached PDF</p>
                      <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-xs">
                        <div>
                          <p className="font-medium text-slate-800">{uploadedFile.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Click open to preview this PDF in a new tab.
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
                            Open PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Your upload has been matched! — Evidence Gallery style */}
                  {articleMatches && (
                    <div className="rounded-lg border bg-white p-4 space-y-4">
                      <h3 className="text-lg font-semibold">Your upload has been matched!</h3>
                      <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
                        <div className="rounded-lg border bg-muted/30 aspect-[4/3] flex items-center justify-center min-h-[180px]">
                          {uploadedFile ? (
                            <div className="p-4 text-center">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm font-medium truncate max-w-[200px] mx-auto">{uploadedFile.name}</p>
                              <Button variant="outline" size="sm" className="mt-2" asChild>
                                <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">
                                  Open PDF
                                </a>
                              </Button>
                            </div>
                          ) : articleUrl ? (
                            <div className="p-4 text-center">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-xs text-muted-foreground line-clamp-2 max-w-[220px]">{articleUrl}</p>
                              <p className="text-[11px] text-muted-foreground mt-1">Article URL added</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Evidence preview</p>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">Matching Criterion</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              AI Generated
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Note: This article may not be suitable for demonstrating all rubric criteria. Consider submitting additional articles or resources to cover the remaining criteria.
                          </p>
                          <div className="space-y-2">
                            {articleMatches.map((m) => (
                              <div
                                key={m.criterion}
                                className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-sm">{m.criterion}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {m.description ?? 'Quality of alignment'}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={m.strength === 'strong' ? 'default' : 'secondary'}
                                  className={`shrink-0 ${
                                    m.strength === 'strong'
                                      ? 'bg-emerald-600 hover:bg-emerald-700'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  }`}
                                >
                                  {m.strength === 'strong' ? '✓ Strong Match' : '◐ Partial Match'}
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setArticleMatches(null)
                              setArticleUrl('')
                              setUploadedFile(null)
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Add More Learning Evidence
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase">RUBRIC OVERVIEW</p>
                    <div className="space-y-4">
                      {rubricCategories.map((cat) => (
                        <div key={cat.title} className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold">{cat.title}</p>
                            <p className="text-xs text-muted-foreground">{cat.subtitle}</p>
                          </div>
                          <div className="grid gap-2 rounded-lg border bg-slate-50 p-3 md:grid-cols-4">
                            {[4, 3, 2, 1].map((score, idx) => (
                              <div
                                key={score}
                                className="space-y-1 rounded-md bg-white p-3 text-xs shadow-sm"
                              >
                                <p className="text-[11px] font-semibold text-slate-500">Level {score}</p>
                                <p className="text-[11px] leading-snug text-slate-700">
                                  {cat.levels[idx]}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <Button variant="outline" onClick={() => setSubmitStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setSubmitStep(3)}>
                      Next: Add your work
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: work + reflection */}
            {submitStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3 · Add your work</CardTitle>
                  <CardDescription>Paste your work and reflect on what you learned.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Your Work</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your essay, notes, or describe your work..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      In production: Upload PDF/DOCX files. Text extraction happens automatically.
                    </p>
                  </div>

                  {selectedMilestone && content && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <p className="text-sm font-medium text-blue-900">📝 Before you submit, reflect on your work:</p>
                      <div className="space-y-2">
                        <Label htmlFor="reflection-1" className="text-sm text-blue-900">
                          1. What did you learn while working on this?
                        </Label>
                        <Textarea
                          id="reflection-1"
                          placeholder="Describe your learning process..."
                          className="bg-white"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reflection-2" className="text-sm text-blue-900">
                          2. What challenges did you face and how did you address them?
                        </Label>
                        <Textarea
                          id="reflection-2"
                          placeholder="Describe any obstacles and your solutions..."
                          className="bg-white"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reflection">Additional Reflection (Optional)</Label>
                    <Textarea
                      id="reflection"
                      placeholder="Any other thoughts about your work or process..."
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setSubmitStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      disabled={!content}
                      onClick={() => setSubmitStep(4)}
                    >
                      Next: Review & submit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: review & submit */}
            {submitStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 4 · Review & submit</CardTitle>
                  <CardDescription>
                    Confirm your checkpoint and submit for AI-powered feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded bg-muted/40 space-y-1">
                    <p className="text-sm font-medium">
                      Checkpoint:{' '}
                      <span className="font-semibold">
                        {selectedMilestone
                          ? `Checkpoint ${project.milestones.findIndex((m) => m.id === selectedMilestone) + 1}`
                          : 'Not selected'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your submission will be analyzed against the rubric. You&apos;ll see strengths, gaps, and next steps in the
                      <span className="font-medium"> My Feedback</span> tab.
                    </p>
                  </div>

                  {aiProcessing && (
                    <AIProcessSteps currentStep={aiStep} steps={aiSteps} />
                  )}

                  <div className="flex justify-between gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setSubmitStep(3)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedMilestone || !content || submitting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {submitting ? 'Processing...' : 'Submit Evidence'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Gallery</CardTitle>
                <CardDescription>
                  Submissions matched with the rubric for each checkpoint. Select a checkpoint to view its evidence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current checkpoint</p>
                  <div className="flex flex-wrap gap-2">
                    {project.milestones.map((m, index) => (
                      <Button
                        key={m.id}
                        variant={galleryCheckpointId === m.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGalleryCheckpointId(m.id)}
                      >
                        Checkpoint {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
                {galleryCheckpointId ? (
                  (() => {
                    const evidenceForCheckpoint = evidence.filter(
                      (ev) => ev.milestoneId === galleryCheckpointId && getFeedbackByEvidence(ev.id).length > 0
                    )
                    const checkpointNum = project.milestones.findIndex((m) => m.id === galleryCheckpointId) + 1
                    if (evidenceForCheckpoint.length === 0) {
                      return (
                        <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">No submissions for this checkpoint yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submissions that have been matched with the rubric will appear here. Submit work in the Submit Work tab.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setActiveTab('submit')}
                          >
                            Go to Submit Work
                          </Button>
                        </div>
                      )
                    }
                    return (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {evidenceForCheckpoint.length} submission{evidenceForCheckpoint.length !== 1 ? 's' : ''} matched with rubric for Checkpoint {checkpointNum}.
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {evidenceForCheckpoint.map((ev) => {
                            const feedbacks = getFeedbackByEvidence(ev.id)
                            const avgScore = feedbacks.length > 0
                              ? (feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length).toFixed(1)
                              : '—'
                            return (
                              <div
                                key={ev.id}
                                className="shrink-0 w-48 rounded-lg border bg-card p-4 flex flex-col gap-3"
                              >
                                <div className="aspect-[4/3] rounded bg-muted flex items-center justify-center">
                                  <FileText className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium">Checkpoint {checkpointNum}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {new Date(ev.submittedAt).toLocaleDateString()} · {avgScore}/4
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{ev.content}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setActiveEvidenceId(ev.id)
                                    setActiveTab('feedback')
                                  }}
                                >
                                  View in My Feedback
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">Select a checkpoint above to view its evidence gallery.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {evidence.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No submissions yet</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {activeEvidenceId && (
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm text-muted-foreground">Report for this submission</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveEvidenceId(null)
                        setExpandedEvidenceIdInList(null)
                      }}
                      className="text-muted-foreground"
                    >
                      View all my submissions
                    </Button>
                  </div>
                )}

                {activeEvidenceId ? (
                  /* Single report view */
                  evidence.filter(ev => ev.id === activeEvidenceId).map((ev, index) => {
                    const feedbacks = getFeedbackByEvidence(ev.id)
                    const checkpointNum = ev.milestoneId ? project.milestones.findIndex(m => m.id === ev.milestoneId) + 1 : 0
                    return (
                      <Card key={`${ev.id}-${index}`} id={`evidence-${ev.id}-${index}`} className="ring-2 ring-primary">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {checkpointNum ? `Checkpoint ${checkpointNum}` : 'Submission'}
                              </CardTitle>
                              <CardDescription>
                                Submitted {new Date(ev.submittedAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <AIUsageStats
                              model={demoAIStats.model}
                              processingTime={demoAIStats.processingTimeMs}
                              tokensUsed={demoAIStats.tokensUsed}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-3 bg-gray-50 rounded border">
                            <p className="text-xs font-medium text-gray-600 mb-1">Your Submission (excerpt):</p>
                            <p className="text-sm text-gray-700 line-clamp-3">{ev.content}</p>
                          </div>
                          {feedbacks.map((fb, fbIdx) => {
                            const criterion = project.rubric.find(c => c.id === fb.criterionId)
                            return (
                              <div key={`${fb.id}-${fbIdx}`} className="p-4 border rounded space-y-2">
                                <div className="flex justify-between items-start">
                                  <p className="font-medium">{criterion?.name}</p>
                                  <Badge>{fb.score}/4</Badge>
                                </div>
                                {fb.strengths.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-green-600">Strengths:</p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {fb.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {fb.gaps.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-yellow-600">Areas to Improve:</p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {fb.gaps.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                  </div>
                                )}
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium">Next Steps:</p>
                                  <p className="text-sm text-muted-foreground">{fb.nextSteps}</p>
                                </div>
                                {fb.reflectionPrompt && (
                                  <div className="pt-2 border-t bg-blue-50 p-3 rounded">
                                    <p className="text-sm font-medium text-blue-900">💭 Reflection Prompt:</p>
                                    <p className="text-sm text-blue-700">{fb.reflectionPrompt}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  /* View all: recent first, collapse/expand on click */
                  (() => {
                    const sortedEvidence = [...evidence].sort(
                      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    )
                    return (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground mb-2">Most recent first. Click a row to expand the report.</p>
                        {sortedEvidence.map((ev, index) => {
                          const feedbacks = getFeedbackByEvidence(ev.id)
                          const checkpointNum = ev.milestoneId ? project.milestones.findIndex(m => m.id === ev.milestoneId) + 1 : 0
                          const avgScore = feedbacks.length > 0
                            ? (feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length).toFixed(1)
                            : '—'
                          const isExpanded = expandedEvidenceIdInList === ev.id
                          return (
                            <Collapsible
                              key={`${ev.id}-${index}`}
                              open={isExpanded}
                              onOpenChange={(open) => setExpandedEvidenceIdInList(open ? ev.id : null)}
                            >
                              <Card className="overflow-hidden">
                                <CollapsibleTrigger asChild>
                                  <button className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="font-medium text-sm">
                                          {checkpointNum ? `Checkpoint ${checkpointNum}` : 'Submission'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Submitted {new Date(ev.submittedAt).toLocaleDateString()} · Score: {avgScore}/4
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                      {avgScore}/4
                                    </Badge>
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="border-t px-4 pb-4 pt-2 space-y-4">
                                    <div className="p-3 bg-gray-50 rounded border">
                                      <p className="text-xs font-medium text-gray-600 mb-1">Your Submission (excerpt):</p>
                                      <p className="text-sm text-gray-700 line-clamp-3">{ev.content}</p>
                                    </div>
                                    {feedbacks.map((fb, fbIdx) => {
                                      const criterion = project.rubric.find(c => c.id === fb.criterionId)
                                      return (
                                        <div key={`${fb.id}-${fbIdx}`} className="p-4 border rounded space-y-2">
                                          <div className="flex justify-between items-start">
                                            <p className="font-medium">{criterion?.name}</p>
                                            <Badge>{fb.score}/4</Badge>
                                          </div>
                                          {fb.strengths.length > 0 && (
                                            <div>
                                              <p className="text-sm font-medium text-green-600">Strengths:</p>
                                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                {fb.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                              </ul>
                                            </div>
                                          )}
                                          {fb.gaps.length > 0 && (
                                            <div>
                                              <p className="text-sm font-medium text-yellow-600">Areas to Improve:</p>
                                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                {fb.gaps.map((g, i) => <li key={i}>{g}</li>)}
                                              </ul>
                                            </div>
                                          )}
                                          <div className="pt-2 border-t">
                                            <p className="text-sm font-medium">Next Steps:</p>
                                            <p className="text-sm text-muted-foreground">{fb.nextSteps}</p>
                                          </div>
                                          {fb.reflectionPrompt && (
                                            <div className="pt-2 border-t bg-blue-50 p-3 rounded">
                                              <p className="text-sm font-medium text-blue-900">💭 Reflection Prompt:</p>
                                              <p className="text-sm text-blue-700">{fb.reflectionPrompt}</p>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </CollapsibleContent>
                              </Card>
                            </Collapsible>
                          )
                        })}
                      </div>
                    )
                  })()
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
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
