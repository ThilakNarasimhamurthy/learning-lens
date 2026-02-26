"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser, logout, login } from '@/lib/auth'
import { getClassesByStudent, joinClass, findClassByJoinCode, getProjectsByIds, seedDemoData } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Users, LogOut, Plus, AlertCircle, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DemoBanner } from '@/components/demo-banner'
import { DeadlineReminder } from '@/components/deadline-reminder'

function StudentDashboardContent() {
  const router = useRouter()
  const [user] = useState(getCurrentUser())
  const [classes, setClasses] = useState<any[]>([])
  const [joinCode, setJoinCode] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Ensure demo student user and demo data for full flow
    let current = getCurrentUser()
    if (!current) {
      const demo = login('student1@demo.com', 'demo')
      if (demo) {
        current = demo
      }
    }
    if (current) {
      seedDemoData()
      setClasses(getClassesByStudent(current.id))
    }
  }, [])

  const handleJoinClass = () => {
    if (!user) return
    
    const classData = findClassByJoinCode(joinCode)
    
    if (classData) {
      const success = joinClass(classData.id, user.id)
      if (success) {
        setClasses(getClassesByStudent(user.id))
        setJoinCode('')
        setDialogOpen(false)
        setError('')
      } else {
        setError('Already joined this class')
      }
    } else {
      setError('Invalid join code')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Get all projects from enrolled classes
  const allProjects = classes.flatMap(c => getProjectsByIds(c.projectIds))

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DeadlineReminder />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allProjects.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>My Classes</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Join Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a Class</DialogTitle>
                      <DialogDescription>Enter the join code provided by your teacher</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="joinCode">Join Code</Label>
                        <Input
                          id="joinCode"
                          placeholder="e.g., ABC123"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          maxLength={6}
                        />
                      </div>
                      {error && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </p>
                      )}
                      <Button onClick={handleJoinClass} disabled={joinCode.length !== 6}>
                        Join Class
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No classes yet. Join a class to get started!</p>
              ) : (
                <div className="space-y-2">
                  {classes.map(classData => (
                    <div key={classData.id} className="p-3 border rounded">
                      <p className="font-medium">{classData.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {classData.projectIds.length} projects
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Active assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {allProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {allProjects.map(project => (
                    <div
                      key={project.id}
                      className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/student/projects/${project.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.milestones.length} milestones
                          </p>
                        </div>
                        <Badge variant="outline">View</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function StudentDashboard() {
  return (
    <AuthGuard requiredRole="student">
      <StudentDashboardContent />
    </AuthGuard>
  )
}
