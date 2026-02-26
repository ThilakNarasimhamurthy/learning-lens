"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser, logout, getUserById, login } from '@/lib/auth'
import {
  getProjectsByTeacher,
  getClassesByTeacher,
  getProgressByProject,
  getFlagsByProject,
  getProject,
  seedDemoData,
} from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Users,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  RefreshCw,
  Bell,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { dedupeById } from '@/lib/utils'

function DashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [lastSynced, setLastSynced] = useState<Date>(new Date())

  useEffect(() => {
    // Ensure demo teacher user and demo data for full flow
    let current = getCurrentUser()
    if (!current) {
      const demo = login('teacher@demo.com', 'demo')
      if (demo) {
        current = demo
      }
    }
    if (current) {
      setUser(current)
      seedDemoData()
      setProjects(dedupeById(getProjectsByTeacher(current.id)))
      setClasses(dedupeById(getClassesByTeacher(current.id)))
    }
  }, [])

  const allFlags = dedupeById(projects.flatMap((p) => getFlagsByProject(p.id)))
  const needSupportCount = allFlags.length

  const getClassStats = (cls: { id: string; name: string; studentIds: string[]; projectIds: string[] }) => {
    const classProgress = cls.projectIds.flatMap((pid) =>
      getProgressByProject(pid).filter((p) => cls.studentIds.includes(p.studentId))
    )
    const lastActivity = classProgress.reduce((max, p) => {
      const d = p.lastActivityDate ? new Date(p.lastActivityDate).getTime() : 0
      return d > max ? d : max
    }, 0)
    const avgScore =
      classProgress.length > 0
        ? (classProgress.reduce((s, p) => s + p.overallScore, 0) / classProgress.length / 4) * 100
        : 0
    const alertCount = allFlags.filter(
      (f) => cls.projectIds.includes(f.projectId) && cls.studentIds.includes(f.studentId)
    ).length
    return {
      lastActivity: lastActivity ? formatTimeAgo(lastActivity) : 'No activity',
      avgProgress: Math.round(avgScore),
      alertCount,
    }
  }

  const getStudentProgressInClass = (cls: { studentIds: string[]; projectIds: string[] }) => {
    return cls.studentIds.map((studentId) => {
      const progressEntries = cls.projectIds.flatMap((pid) =>
        getProgressByProject(pid).filter((p) => p.studentId === studentId)
      )
      const avgProgress =
        progressEntries.length > 0
          ? Math.round(
              (progressEntries.reduce((s, p) => s + p.overallScore, 0) / progressEntries.length / 4) * 100
            )
          : 0
      const lastActivity = progressEntries.reduce((max, p) => {
        const d = p.lastActivityDate ? new Date(p.lastActivityDate).getTime() : 0
        return d > max ? d : max
      }, 0)
      const status = progressEntries.some((p) => p.status === 'red')
        ? 'red'
        : progressEntries.some((p) => p.status === 'yellow')
          ? 'yellow'
          : progressEntries.length > 0
            ? 'green'
            : 'none'
      return {
        studentId,
        name: getUserById(studentId)?.name ?? studentId,
        avgProgress,
        lastActivity: lastActivity ? formatTimeAgo(lastActivity) : 'No activity',
        status,
        projectCount: progressEntries.length,
        totalProjects: cls.projectIds.length,
      }
    })
  }

  function formatTimeAgo(ms: number) {
    const mins = Math.floor((Date.now() - ms) / 60000)
    if (mins < 60) return `${mins} min ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const filteredClasses = classes.filter(
    (c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleRefresh = () => {
    if (user) {
      setProjects(dedupeById(getProjectsByTeacher(user.id)))
      setClasses(dedupeById(getClassesByTeacher(user.id)))
      setLastSynced(new Date())
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header — minimal */}
      <header className="border-b border-gray-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <BookOpen className="h-5 w-5 text-gray-500" aria-hidden />
            <h1 className="text-lg font-semibold text-gray-900">Teacher Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search students, classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50/50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              aria-label="Search"
            />
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 text-gray-700">
                  <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                    {user?.name?.slice(0, 2) ?? 'T'}
                  </span>
                  <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary stats — 4 KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Classes</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{classes.length}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Students</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {classes.reduce((sum, c) => sum + c.studentIds.length, 0)}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium uppercase tracking-wide">Need Support</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{needSupportCount}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Last Updated</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatTimeAgo(lastSynced.getTime())}</p>
          </div>
        </div>

        {/* Data synced + Refresh */}
        <div className="flex items-center justify-between gap-4 mb-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Data synced: {lastSynced.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-gray-500">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Main content tabs: Overview, Classes, Support */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start rounded-md bg-gray-100 text-gray-600 h-10">
            <TabsTrigger
              value="overview"
              className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-900 flex items-center gap-1.5"
            >
              Classes
              <span className="inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-[11px] px-1.5 min-w-[20px]">
                {classes.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-900 flex items-center gap-1.5"
            >
              Support
              <span className="inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 text-[11px] px-1.5 min-w-[20px]">
                {allFlags.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ——— 1. OVERVIEW (projects snapshot) ——— */}
          <TabsContent value="overview" className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-600" />
                  Projects
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/teacher/projects')}
                    className="text-gray-600 border-gray-200"
                  >
                    View all
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/teacher/projects/new')}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New project
                  </Button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                {projects.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No projects yet. Create your first project.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {projects.slice(0, 5).map((project) => (
                      <li key={project.id}>
                        <button
                          onClick={() => router.push(`/teacher/projects/${project.id}`)}
                          className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{project.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {project.milestones.length} milestones · {project.standards?.length ?? 0} standards
                            </p>
                          </div>
                          <span
                            className={`shrink-0 text-xs font-medium px-2 py-1 rounded ${
                              project.status === 'published'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {project.status}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </TabsContent>

          {/* ——— 2. CLASSES ——— */}
          <TabsContent value="classes" className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  Classes
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/teacher/classes')}
                  className="text-gray-600 border-gray-200"
                >
                  Manage
                </Button>
              </div>
              <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                {filteredClasses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    {search ? 'No classes match your search.' : 'No classes yet. Create one from Manage.'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredClasses.map((cls, classIndex) => {
                      const stats = getClassStats(cls)
                      return (
                        <Collapsible key={`${cls.id}-${classIndex}`}>
                          <div className="border-0">
                            <CollapsibleTrigger asChild>
                              <button className="group w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors">
                                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{cls.name}</p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {cls.studentIds.length} students
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {stats.lastActivity}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="w-24">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gray-400 rounded-full"
                                        style={{ width: `${Math.min(100, stats.avgProgress)}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">Avg {stats.avgProgress}%</p>
                                  </div>
                                  {stats.alertCount > 0 && (
                                    <span className="flex items-center justify-center h-7 min-w-[28px] rounded bg-red-50 text-red-600 text-xs font-medium">
                                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                      {stats.alertCount}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Students & progress</p>
                                  <ul className="space-y-1.5">
                                    {getStudentProgressInClass(cls).map((s) => (
                                      <li key={s.studentId} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-100/80">
                                        <span className="shrink-0 w-5 flex items-center justify-center">
                                          {s.status === 'green' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                          {s.status === 'yellow' && <Clock className="h-4 w-4 text-yellow-500" />}
                                          {s.status === 'red' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                          {s.status === 'none' && <span className="h-2 w-2 rounded-full bg-gray-300" />}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 min-w-0 truncate flex-1">{s.name}</span>
                                        <div className="shrink-0 flex items-center gap-2">
                                          <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-gray-500 rounded-full"
                                              style={{ width: `${Math.min(100, s.avgProgress)}%` }}
                                            />
                                          </div>
                                          <span className="text-xs text-gray-500 tabular-nums w-8">{s.avgProgress}%</span>
                                          <span className="text-xs text-gray-400">{s.lastActivity}</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Projects</p>
                                  <div className="flex flex-wrap gap-2">
                                    {cls.projectIds.map((pid: string) => {
                                      const proj = getProject(pid)
                                      return proj ? (
                                        <button
                                          key={pid}
                                          onClick={() => router.push(`/teacher/projects/${pid}`)}
                                          className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                                        >
                                          {proj.title}
                                        </button>
                                      ) : null
                                    })}
                                    <button
                                      onClick={() => router.push('/teacher/projects/new')}
                                      className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                                    >
                                      <Plus className="h-3 w-3" />
                                      New project
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          {/* ——— 3. SUPPORT ——— */}
          <TabsContent value="support" className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Support
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  AI-analyzed
                </span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Students needing support — LLM flagged
              </p>
              <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                {allFlags.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No students currently flagged for support.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {allFlags.map((flag) => {
                      const project = getProject(flag.projectId)
                      const studentName = getUserById(flag.studentId)?.name ?? flag.studentId
                      const isHigh = flag.severity === 'high'
                      return (
                        <li key={flag.id}>
                          <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                            <span
                              className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                                isHigh ? 'bg-red-500' : 'bg-amber-500'
                              }`}
                              aria-hidden
                            />
                            <div className="flex-1 min-w-0 space-y-2">
                              <p className="font-medium text-gray-900">{studentName}</p>
                              <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                                {project?.title ?? 'Project'}
                              </span>
                              <p className="text-sm text-gray-600">{flag.reason}</p>
                              <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Suggested support
                                </p>
                                <p className="text-sm text-gray-700">{flag.suggestedIntervention}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 border-gray-200 text-gray-600 self-start sm:self-center"
                              onClick={() => router.push(`/teacher/projects/${flag.projectId}`)}
                            >
                              View
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-8 text-center">
          All data is sample. AI analysis runs on student activity and submissions.
        </p>
      </main>
    </div>
  )
}

export default function TeacherDashboard() {
  return (
    <AuthGuard requiredRole="teacher">
      <DashboardContent />
    </AuthGuard>
  )
}
