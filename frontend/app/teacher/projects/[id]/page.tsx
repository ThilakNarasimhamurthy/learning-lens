"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getProject, updateProject, getProgressByProject, getClassesByTeacher, getFlagsByProject, resolveFlag, assignProjectToClass, getEvidenceByStudent, getFeedbackByEvidence } from '@/lib/data-store'
import { dedupeById } from '@/lib/utils'
import { getCurrentUser, getUserById } from '@/lib/auth'
import type { Project, StudentProgress, Flag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, AlertCircle, CheckCircle, Clock, AlertTriangle, XCircle, ChevronDown, ChevronUp, FileText, HelpCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

function ProjectDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [user] = useState(getCurrentUser())
  const [project, setProject] = useState<Project | null>(null)
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [flags, setFlags] = useState<Flag[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [messageDialogRecipient, setMessageDialogRecipient] = useState('')
  const [messageDialogType, setMessageDialogType] = useState<'message' | 'guidance'>('message')
  const [messageBody, setMessageBody] = useState('')
  const [selectedClassIdToAssign, setSelectedClassIdToAssign] = useState<string>('')
  const [messageSentForFlagIds, setMessageSentForFlagIds] = useState<Set<string>>(new Set())
  const [messageDialogFlagId, setMessageDialogFlagId] = useState<string | null>(null)

  const assignedClasses = project ? classes.filter(c => c.projectIds.includes(project.id)) : []

  useEffect(() => {
    if (user) {
      setClasses(dedupeById(getClassesByTeacher(user.id)))
    }
  }, [user])

  useEffect(() => {
    const proj = getProject(params.id as string)
    if (proj) {
      setProject(proj)
      setProgress(getProgressByProject(proj.id))
      setFlags(dedupeById(getFlagsByProject(proj.id)))
    }
  }, [params.id])

  const handlePublish = () => {
    if (project) {
      updateProject(project.id, { status: 'published' })
      setProject({ ...project, status: 'published' })
    }
  }

  const openMessageDialog = (recipientName: string, type: 'message' | 'guidance', flagId?: string) => {
    setMessageDialogRecipient(recipientName)
    setMessageDialogType(type)
    setMessageBody('')
    setMessageDialogFlagId(flagId ?? null)
    setMessageDialogOpen(true)
  }

  const handleSendMessageOrGuidance = () => {
    const action = messageDialogType === 'message' ? 'Message' : 'Guidance'
    toast({
      title: `${action} sent`,
      description: messageBody.trim()
        ? `Your ${messageDialogType} was sent to ${messageDialogRecipient}.`
        : `${action} sent to ${messageDialogRecipient}.`,
    })
    if (messageDialogType === 'message' && messageDialogFlagId) {
      setMessageSentForFlagIds(prev => new Set(prev).add(messageDialogFlagId))
    }
    setMessageDialogOpen(false)
    setMessageBody('')
    setMessageDialogFlagId(null)
  }

  const handleAssignToClass = () => {
    if (!user || !project || !selectedClassIdToAssign) return
    const classId = selectedClassIdToAssign
    const success = assignProjectToClass(classId, project.id)
    const classData = classes.find(c => c.id === classId)
    const className = classData?.name || 'class'
    if (success) {
      toast({
        title: 'Assigned to class',
        description: `This project is now assigned to ${className}.`,
      })
      setClasses(dedupeById(getClassesByTeacher(user.id)))
      setSelectedClassIdToAssign('')
    } else {
      toast({
        title: 'Already assigned',
        description: `This project is already assigned to ${className}.`,
        variant: 'destructive',
      })
    }
  }

  if (!project) return <div>Loading...</div>

  const flaggedStudents = progress.filter(p => p.status === 'red' || p.status === 'yellow')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-between items-start mt-2">
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <Badge className="mt-2">{project.status}</Badge>
            </div>
            {project.status === 'draft' && (
              <Button onClick={handlePublish}>Publish Project</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-11 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Student Progress
            </TabsTrigger>
            <TabsTrigger value="flags" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              Active Flags
              {flags.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-medium text-red-700">
                  {flags.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="help" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
              Need Help
              {flaggedStudents.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-medium text-amber-700">
                  {flaggedStudents.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Task Type</p>
                  <p className="text-sm text-muted-foreground capitalize">{project.taskType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Standards ({project.standards.length})</p>
                  <div className="space-y-1 mt-2">
                    {project.standards.map(s => (
                      <p key={s.id} className="text-xs text-muted-foreground">{s.code}: {s.description}</p>
                    ))}
                  </div>
                </div>
                {project.attachments && project.attachments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Images & documents</p>
                    <div className="flex flex-wrap gap-3 mt-2">
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
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assign to Class</CardTitle>
                <CardDescription>Make this project available to students in a class. Select a class and click Assign.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignedClasses.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Assigned to: {assignedClasses.map(c => c.name).join(', ')}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={selectedClassIdToAssign}
                    onValueChange={setSelectedClassIdToAssign}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a class to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c, index) => (
                        <SelectItem key={`${c.id}-${index}`} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignToClass}
                    disabled={!selectedClassIdToAssign}
                    className="shrink-0"
                  >
                    Assign to class
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestones ({project.milestones.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.milestones.map(m => (
                  <div key={m.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(m.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>{progress.length} students · Expand a row to see submission details</CardDescription>
              </CardHeader>
              <CardContent>
            {progress.length === 0 ? (
              <p className="text-sm text-muted-foreground">No student submissions yet. Assign this project to a class so students can see it and submit work.</p>
            ) : (
              <div className="space-y-1">
                {progress.map(p => {
                  const studentName = getUserById(p.studentId)?.name ?? p.studentId
                  const evidence = dedupeById(getEvidenceByStudent(p.studentId, project.id))
                  const isExpanded = expandedStudentId === p.studentId
                  const lastActivity = p.lastActivityDate ? new Date(p.lastActivityDate).toLocaleDateString() : '—'
                  return (
                    <Collapsible
                      key={p.studentId}
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedStudentId(open ? p.studentId : null)}
                    >
                      <div className="border rounded-lg p-3 hover:bg-gray-50/50">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            {p.status === 'green' && <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />}
                            {p.status === 'yellow' && <Clock className="h-5 w-5 shrink-0 text-yellow-500" />}
                            {p.status === 'red' && <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{studentName}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.completedMilestones.length}/{project.milestones.length} milestones · {evidence.length} submission{evidence.length !== 1 ? 's' : ''} · Last: {lastActivity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-sm font-semibold tabular-nums">{(p.overallScore).toFixed(1)}<span className="text-muted-foreground font-normal">/4</span></span>
                            <CollapsibleTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-muted-foreground">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                {isExpanded ? 'Less' : 'Details'}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        {p.flagReason && (
                          <p className="text-xs text-amber-700 mt-1.5 pl-8">{p.flagReason}</p>
                        )}
                      </div>
                      <CollapsibleContent>
                        <div className="mt-1 mb-2 ml-2 pl-4 border-l-2 border-gray-200 space-y-3">
                          {evidence.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">No submissions yet</p>
                          ) : (
                            evidence.map((ev, evIndex) => {
                              const feedbacks = getFeedbackByEvidence(ev.id)
                              const milestone = project.milestones.find(m => m.id === ev.milestoneId)
                              const avg = feedbacks.length > 0
                                ? (feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length).toFixed(1)
                                : '—'
                              const firstGap = feedbacks.find(f => f.gaps.length > 0)?.gaps[0]
                              return (
                                <div key={`${p.studentId}-${ev.id}-${evIndex}`} className="py-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    {milestone?.name ?? ev.milestoneId} · {new Date(ev.submittedAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Score: {avg}/4
                                  </p>
                                  {ev.content && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ev.content}</p>
                                  )}
                                  {firstGap && (
                                    <p className="text-xs text-amber-700 mt-1">Note: {firstGap}</p>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="flags" className="mt-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Active Flags ({flags.length})
                </CardTitle>
                <CardDescription>Students requiring intervention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {flags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No flags for this project.</p>
                ) : (
                  flags.map((flag, idx) => (
                    <div key={`${flag.id}-${idx}`} className="p-4 bg-white border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {flag.severity === 'high' && <XCircle className="h-4 w-4 text-red-500" />}
                          {flag.severity === 'medium' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          {flag.severity === 'low' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                          <p className="text-sm font-medium">{getUserById(flag.studentId)?.name ?? flag.studentId}</p>
                        </div>
                        <Badge variant={flag.severity === 'high' ? 'destructive' : 'secondary'}>
                          {flag.flagType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{flag.reason}</p>
                      <div className="p-2 bg-blue-50 rounded text-sm text-blue-900 mb-2">
                        <p className="font-medium">💡 Suggested Intervention:</p>
                        <p>{flag.suggestedIntervention}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {messageSentForFlagIds.has(flag.id) ? (
                          <Button size="sm" variant="secondary" disabled className="shrink-0">
                            Message sent
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => openMessageDialog(getUserById(flag.studentId)?.name ?? flag.studentId, 'message', flag.id)}
                          >
                            Send Message
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="shrink-0"
                          onClick={() => {
                            resolveFlag(flag.id)
                            setFlags(dedupeById(getFlagsByProject(project?.id || '')))
                          }}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-yellow-600" />
                  Need Help ({flaggedStudents.length})
                </CardTitle>
                <CardDescription>Students with low scores or missed milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {flaggedStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students need help for this project.</p>
                ) : (
                  flaggedStudents.map(p => (
                    <div key={p.studentId} className="p-3 bg-white border rounded">
                      <p className="text-sm font-medium">{getUserById(p.studentId)?.name ?? p.studentId}</p>
                      <p className="text-xs text-muted-foreground">{p.flagReason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last activity: {p.lastActivityDate ? new Date(p.lastActivityDate).toLocaleDateString() : 'Never'}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => openMessageDialog(getUserById(p.studentId)?.name ?? p.studentId, 'guidance')}
                      >
                        Send Guidance
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {messageDialogType === 'message' ? 'Send message' : 'Send guidance'} to {messageDialogRecipient}
            </DialogTitle>
            <DialogDescription>
              {messageDialogType === 'message'
                ? 'Compose a message to the student. They will see it in their notifications.'
                : 'Share guidance or resources. The student will see this as support for their work.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="message-body">
              {messageDialogType === 'message' ? 'Message' : 'Guidance'} (optional)
            </Label>
            <Textarea
              id="message-body"
              placeholder={
                messageDialogType === 'message'
                  ? 'e.g. Let\'s discuss your submission in office hours...'
                  : 'e.g. Try reviewing the rubric for criterion 2. Here are some tips...'
              }
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessageOrGuidance}>
              Send {messageDialogType === 'message' ? 'message' : 'guidance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProjectDetail() {
  return (
    <AuthGuard requiredRole="teacher">
      <ProjectDetailContent />
    </AuthGuard>
  )
}
