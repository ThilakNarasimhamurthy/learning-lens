"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = login(email, password)
    
    if (user) {
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } else {
      setError('Invalid credentials')
    }
  }

  const handleDemoLogin = (role: 'teacher' | 'student') => {
    const demoEmail = role === 'teacher' ? 'teacher@demo.com' : 'student1@demo.com'
    const user = login(demoEmail, 'demo')
    if (user) {
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/student/dashboard')
      }
    } else {
      setError('Demo account not available')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">EduFlow AI</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="login-email"
                type="email"
                placeholder="teacher@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="login-password"
                type="password"
                placeholder="Any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" data-testid="login-submit">Sign In</Button>
          </form>
          
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p className="font-semibold">Quick demo sign in:</p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('teacher')}
              >
                Sign in as Demo Teacher
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDemoLogin('student')}
              >
                Sign in as Demo Student
              </Button>
            </div>
            <p className="text-xs mt-2">
              Or use email <strong>teacher@demo.com</strong> / <strong>student1@demo.com</strong> with any password.
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push('/register')}
            >
              Create new account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
