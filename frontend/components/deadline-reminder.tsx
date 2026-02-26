"use client"

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getClassesByStudent, getProjectsByIds } from '@/lib/data-store'
import { AlertCircle, Clock } from 'lucide-react'
import { Badge } from './ui/badge'

export function DeadlineReminder() {
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Array<{
    projectTitle: string
    milestoneName: string
    dueDate: string
    daysUntil: number
  }>>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'student') return

    const classes = getClassesByStudent(user.id)
    const projects = classes.flatMap(c => getProjectsByIds(c.projectIds))
    
    const now = new Date()
    const deadlines: typeof upcomingDeadlines = []

    projects.forEach(project => {
      project.milestones.forEach(milestone => {
        const dueDate = new Date(milestone.dueDate)
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        // Show reminders for deadlines within 7 days
        if (daysUntil >= 0 && daysUntil <= 7) {
          deadlines.push({
            projectTitle: project.title,
            milestoneName: milestone.name,
            dueDate: milestone.dueDate,
            daysUntil
          })
        }
      })
    })

    // Sort by days until due
    deadlines.sort((a, b) => a.daysUntil - b.daysUntil)
    setUpcomingDeadlines(deadlines)
  }, [])

  if (upcomingDeadlines.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-2">Upcoming Deadlines</h3>
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-yellow-900">{deadline.projectTitle}</p>
                  <p className="text-yellow-700">{deadline.milestoneName}</p>
                </div>
                <Badge variant={deadline.daysUntil === 0 ? 'destructive' : deadline.daysUntil <= 2 ? 'default' : 'secondary'}>
                  <Clock className="h-3 w-3 mr-1" />
                  {deadline.daysUntil === 0 ? 'Due today' : `${deadline.daysUntil} days`}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
