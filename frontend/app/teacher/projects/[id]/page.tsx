"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import {
  getProject,
  updateProject,
  getProgressByProject,
  getClassesByTeacher,
  getFlagsByProject,
  assignProjectToClass,
  getEvidenceByProject,
} from '@/lib/data-store'
import { dedupeById } from '@/lib/utils'
import { getCurrentUser, getUserById } from '@/lib/auth'
import type { Project, StudentProgress, Flag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  AlertTriangle,
  Rocket,
  Trophy,
  BarChart3,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

const REALTIME_KEYS = ['eduflow_evidence', 'eduflow_feedback', 'eduflow_progress', 'eduflow_flags']

function ProjectDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [flags, setFlags] = useState<Flag[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<string[]>([])
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [messageDialogRecipient, setMessageDialogRecipient] = useState('')
  const [messageDialogType, setMessageDialogType] = useState<'message' | 'guidance'>('message')
  const [messageBody, setMessageBody] = useState('')
  const [selectedClassIdToAssign, setSelectedClassIdToAssign] = useState<string>('')
  const [messageSentForFlagIds, setMessageSentForFlagIds] = useState<Set<string>>(new Set())
  const [messageDialogFlagId, setMessageDialogFlagId] = useState<string | null>(null)

  const assignedClasses = project ? classes.filter((c) => c.projectIds.includes(project.id)) : []
  const subjectTag = project?.standards?.[0]?.category || 'Project'

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    if (u) {
      setClasses(dedupeById(getClassesByTeacher(u.id)))
    }
  }, [])

  const refreshData = useCallback(() => {
    const proj = getProject(params.id as string)
    if (proj) {
      setProject(proj)
      setProgress(getProgressByProject(proj.id))
      setFlags(dedupeById(getFlagsByProject(proj.id)))
      const ms = proj.milestones
      const now = new Date()
      const pastDue = ms.find((m) => new Date(m.dueDate) < now && (!m.opensOn || new Date(m.opensOn) <= now))
      const active = ms.find((m) => {
        const due = new Date(m.dueDate)
        const open = m.opensOn ? new Date(m.opensOn) : null
        return (!open || open <= now) && due >= now
      })
      const toShow = [pastDue, active].filter(Boolean).map((m) => m!.id)
      if (toShow.length >= 2) {
        setSelectedCheckpoints(toShow.slice(0, 2))
      } else if (ms.length >= 2) {
        setSelectedCheckpoints([ms[0].id, ms[1].id])
      } else if (ms.length === 1) {
        setSelectedCheckpoints([ms[0].id])
      }
    }
  }, [params.id])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Real-time updates when a student submits in another tab (storage event)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key && REALTIME_KEYS.includes(e.key)) {
        refreshData()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [refreshData])

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
      setMessageSentForFlagIds((prev) => new Set(prev).add(messageDialogFlagId))
    }
    setMessageDialogOpen(false)
    setMessageBody('')
    setMessageDialogFlagId(null)
  }

  const handleAssignToClass = () => {
    if (!user || !project || !selectedClassIdToAssign) return
    const classId = selectedClassIdToAssign
    const success = assignProjectToClass(classId, project.id)
    const classData = classes.find((c) => c.id === classId)
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

  if (!project) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const totalStudents = progress.length
  const evidenceByProject = getEvidenceByProject(project.id)

  const getMilestoneState = (m: (typeof project.milestones)[0]) => {
    const now = new Date()
    const dueDate = new Date(m.dueDate)
    const isNotOpenYet = m.opensOn && new Date(m.opensOn) > now
    if (isNotOpenYet) return 'inactive'
    if (dueDate < now) return 'past-due'
    return 'active'
  }

  const getCompletedCountForMilestone = (milestoneId: string) => {
    return new Set(
      evidenceByProject.filter((e) => e.milestoneId === milestoneId).map((e) => e.studentId)
    ).size
  }

  const getSupportNeededForMilestone = (milestoneId: string) => {
    const completed = new Set(
      evidenceByProject.filter((e) => e.milestoneId === milestoneId).map((e) => e.studentId)
    )
    return progress
      .filter((p) => !completed.has(p.studentId))
      .map((p) => getUserById(p.studentId)?.name ?? p.studentId)
      .slice(0, 5)
  }

  const getStudentGroup = (studentId: string) => {
    const cls = assignedClasses.find((c) => c.studentIds.includes(studentId))
    return cls?.name ?? '—'
  }

  const displayCheckpoints = selectedCheckpoints.length > 0
    ? project.milestones.filter((m) => selectedCheckpoints.includes(m.id))
    : project.milestones.slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              {assignedClasses[0] && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {assignedClasses[0].name}
                </Badge>
              )}
              <Badge variant="outline" className="bg-white">
                {subjectTag}
              </Badge>
              <Badge variant="default">
                Published
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Support Alert */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Support Alert</h2>
          {flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students currently flagged for support.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {flags.map((flag) => {
                const isHigh = flag.severity === 'high'
                return (
                  <div
                    key={flag.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-white shadow-sm hover:shadow transition-shadow"
                  >
                    <span
                      className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                        isHigh ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {getUserById(flag.studentId)?.name ?? flag.studentId}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {subjectTag}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">{flag.reason}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          openMessageDialog(
                            getUserById(flag.studentId)?.name ?? flag.studentId,
                            'message',
                            flag.id
                          )
                        }
                      >
                        Send Message
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="View progress"
                    >
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Checkpoint Status */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Task Status</h2>

          {/* Timeline */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <Rocket className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1 flex items-center gap-1 min-w-0 overflow-x-auto pb-2">
              {project.milestones.map((m, index) => {
                const state = getMilestoneState(m)
                const isSelected = selectedCheckpoints.includes(m.id)
                return (
                  <div key={m.id} className="flex items-center flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCheckpoints((prev) => {
                          const next = prev.filter((id) => id !== m.id)
                          if (next.length < 2) return [...next, m.id]
                          return [next[0], m.id]
                        })
                      }}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 transition-colors font-semibold text-sm ${
                        isSelected
                          ? 'border-gray-900 bg-gray-100 text-gray-900 ring-2 ring-gray-900/20'
                          : state === 'past-due'
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : state === 'active'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                      title={`Task ${index + 1}: ${m.name}`}
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
            <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
          </div>

          {/* Checkpoint detail cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {displayCheckpoints.map((m, idx) => {
              const state = getMilestoneState(m)
              const completedCount = getCompletedCountForMilestone(m.id)
              const supportNeeded = getSupportNeededForMilestone(m.id)
              const isPastDue = state === 'past-due'
              return (
                <div
                  key={m.id}
                  className="rounded-lg border bg-gray-100/80 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700">
                      {project.milestones.indexOf(m) + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isPastDue ? 'PAST DUE ' : ''}
                      {new Date(m.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">Learn: {m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                  <p className="text-sm font-medium">
                    Task Completed: {completedCount}/{totalStudents || 1}
                  </p>
                  {supportNeeded.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Support Needed:</p>
                      <p className="text-sm text-muted-foreground">
                        {supportNeeded.join(', ')}
                        {supportNeeded.length >= 5 ? '…' : ''}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Skill Snapshot */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Skill Snapshot</h2>
          <div className="rounded-lg border bg-white overflow-hidden">
            {progress.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No student submissions yet. Assign this project to a class so students can get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left font-medium text-gray-700 px-4 py-3">Name</th>
                      <th className="text-left font-medium text-gray-700 px-4 py-3">Group</th>
                      <th className="text-left font-medium text-gray-700 px-4 py-3">Success Indicator</th>
                      <th className="text-left font-medium text-gray-700 px-4 py-3">Progress Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.map((p) => {
                      const studentName = getUserById(p.studentId)?.name ?? p.studentId
                      return (
                        <tr
                          key={p.studentId}
                          className="border-b last:border-0 hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">{studentName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{getStudentGroup(p.studentId)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  p.status === 'red' ? 'bg-red-500' : p.status === 'yellow' ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                              />
                              <span className="text-muted-foreground capitalize">{p.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center text-muted-foreground">
                              <BarChart3 className="h-4 w-4" aria-label="Progress report" />
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Assign to Class (compact) */}
        {classes.length > 0 && (
          <section className="rounded-lg border bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Assign to Class</h3>
            {assignedClasses.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                Assigned to: {assignedClasses.map((c) => c.name).join(', ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedClassIdToAssign} onValueChange={setSelectedClassIdToAssign}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAssignToClass} disabled={!selectedClassIdToAssign}>
                Assign to class
              </Button>
            </div>
          </section>
        )}
      </main>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {messageDialogType === 'message' ? 'Send message' : 'Send guidance'} to{' '}
              {messageDialogRecipient}
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
                  ? "e.g. Let's discuss your submission in office hours..."
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
