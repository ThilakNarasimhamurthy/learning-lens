"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, TrendingUp, CheckCircle, ArrowRight, Sparkles, Target, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learning Lens
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          AI-Powered Project-Based Learning
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Transform Student Learning
          <br />
          with Intelligent Feedback
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Standards-based project management with AI-powered feedback. 
          Track progress, identify struggling students, and provide personalized guidance at scale.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/register')} className="text-lg px-8">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/login')} className="text-lg px-8">
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600">Powerful tools for teachers and students</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Standards-Based Projects</CardTitle>
              <CardDescription>
                Align projects to CCSS, NGSS, and custom standards with AI-generated rubrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-indigo-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>AI Feedback Engine</CardTitle>
              <CardDescription>
                Instant rubric-aligned feedback with strengths, gaps, and actionable next steps
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Real-time dashboards with color-coded status and automatic flagging
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Milestone System</CardTitle>
              <CardDescription>
                Task-based submissions with deadlines and automated reminders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>
                Easy enrollment with join codes, project assignment, and student grouping
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Intervention Alerts</CardTitle>
              <CardDescription>
                Automatic flagging of struggling students with suggested guidance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple workflow, powerful results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Teacher Creates</h3>
              <p className="text-gray-600">
                Set up projects with standards, rubrics, and milestones. Assign to classes with one click.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Students Submit</h3>
              <p className="text-gray-600">
                Upload work at tasks. Get instant AI feedback with specific guidance for improvement.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Monitor & Intervene</h3>
              <p className="text-gray-600">
                Track progress in real-time. System flags students who need help. Provide targeted support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">10x</div>
            <div className="text-gray-600">Faster Feedback</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-600 mb-2">85%</div>
            <div className="text-gray-600">Student Engagement</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">50%</div>
            <div className="text-gray-600">Time Saved</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-600 mb-2">95%</div>
            <div className="text-gray-600">Teacher Satisfaction</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teachers using AI to enhance student learning
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push('/register')} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')} className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Learning Lens</span>
            </div>
            <div className="text-sm">
              © 2026 Learning Lens. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
