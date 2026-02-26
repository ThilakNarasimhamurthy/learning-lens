"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser } from '@/lib/auth'
import { getProjectsByTeacher } from '@/lib/data-store'
import { dedupeById } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus } from 'lucide-react'

function ProjectsListContent() {
  const router = useRouter()
  const [user] = useState(getCurrentUser())
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      setProjects(dedupeById(getProjectsByTeacher(user.id)))
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push('/teacher/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center mt-2">
            <h1 className="text-2xl font-bold">All Projects</h1>
            <Button onClick={() => router.push('/teacher/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Button onClick={() => router.push('/teacher/projects/new')}>
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Card 
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/teacher/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{project.standards.length} standards</p>
                    <p>{project.milestones.length} milestones</p>
                    <p className="capitalize">{project.taskType} task</p>
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

export default function ProjectsList() {
  return (
    <AuthGuard requiredRole="teacher">
      <ProjectsListContent />
    </AuthGuard>
  )
}
