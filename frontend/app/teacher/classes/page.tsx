"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser } from '@/lib/auth'
import { getClassesByTeacher, createClass } from '@/lib/data-store'
import { dedupeById } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Users, Copy } from 'lucide-react'

function ClassesContent() {
  const router = useRouter()
  const [user] = useState(getCurrentUser())
  const [classes, setClasses] = useState<any[]>([])
  const [newClassName, setNewClassName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setClasses(dedupeById(getClassesByTeacher(user.id)))
    }
  }, [user])

  const handleCreateClass = () => {
    if (!user || !newClassName) return
    
    const newClass = createClass({
      name: newClassName,
      teacherId: user.id,
      studentIds: [],
      projectIds: []
    })
    
    setClasses(dedupeById(getClassesByTeacher(user.id)))
    setNewClassName('')
    setDialogOpen(false)
  }

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Join code copied!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push('/teacher/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center mt-2">
            <h1 className="text-2xl font-bold">My Classes</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>Add a new class to organize your students</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g., Period 3 English"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateClass} disabled={!newClassName}>
                    Create Class
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No classes yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                Create Your First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map(classData => (
              <Card key={classData.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {classData.name}
                  </CardTitle>
                  <CardDescription>
                    {classData.studentIds.length} students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Join Code</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-bold text-lg">{classData.joinCode}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyJoinCode(classData.joinCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {classData.projectIds.length} projects assigned
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Classes() {
  return (
    <AuthGuard requiredRole="teacher">
      <ClassesContent />
    </AuthGuard>
  )
}
