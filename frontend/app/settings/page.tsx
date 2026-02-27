"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { clearAllData, seedDemoData } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trash2, Database } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null)

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    if (!u) router.push('/login')
  }, [router])

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete all projects, classes, and submissions.')) {
      clearAllData()
      alert('All data cleared!')
      router.push(user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    }
  }

  const handleSeedData = () => {
    seedDemoData()
    alert('Demo data added! Refresh the page to see it.')
    window.location.reload()
  }

  const handleResetToDemo = () => {
    if (confirm('Replace all data with fresh demo data? This will clear everything first.')) {
      seedDemoData({ force: true })
      alert('Reset complete! Refreshing...')
      window.location.reload()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mt-2">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your local data storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> All data is stored in your browser's localStorage. 
                It persists across page refreshes but is specific to this browser.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleSeedData}
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                Seed Demo Data
              </Button>
              <Button
                variant="outline"
                onClick={handleResetToDemo}
                className="w-full justify-start"
              >
                <Database className="h-4 w-4 mr-2" />
                Reset to Demo Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Seed: adds demo data when empty. Reset: clears all data and loads fresh demo (6 projects with all task states).
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="destructive"
                onClick={handleClearData}
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Delete all projects, classes, submissions, and feedback
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
