"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { getCurrentUser } from '@/lib/auth'
import { createProject, STANDARDS_LIBRARY, generateRubricFromStandards, suggestCheckpointsFromProject } from '@/lib/data-store'
import type { Standard, RubricCriterion, Milestone, ProjectAttachment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, Plus, Trash2, Sparkles, ImagePlus, FileText, X } from 'lucide-react'
import { AIProcessSteps } from '@/components/ai-indicator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function NewProjectContent() {
  const router = useRouter()
  const [user] = useState(getCurrentUser())
  
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskType, setTaskType] = useState<'individual' | 'group'>('individual')
  const [selectedStandards, setSelectedStandards] = useState<Standard[]>([])
  const [customStandards, setCustomStandards] = useState<Standard[]>([])
  const [aiGeneratingRubric, setAiGeneratingRubric] = useState(false)
  const [aiRubricStep, setAiRubricStep] = useState(0)
  const [addStandardOpen, setAddStandardOpen] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [aiSuggestingCheckpoints, setAiSuggestingCheckpoints] = useState(false)
  const [aiCheckpointStep, setAiCheckpointStep] = useState(0)
  const [rubric, setRubric] = useState<RubricCriterion[]>([
    {
      id: 'c1',
      name: 'Thesis & Argument',
      description: 'Clear thesis with supporting arguments',
      weight: 30,
      maxScore: 4,
      levels: [
        { score: 4, label: 'Excellent', description: 'Strong, clear thesis with compelling arguments' },
        { score: 3, label: 'Proficient', description: 'Clear thesis with adequate support' },
        { score: 2, label: 'Developing', description: 'Thesis present but needs development' },
        { score: 1, label: 'Beginning', description: 'Unclear or missing thesis' },
      ]
    }
  ])
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'm1',
      name: 'Initial Draft',
      description: 'Submit first draft with thesis statement',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      order: 1
    }
  ])

  const allStandardsList = [...STANDARDS_LIBRARY, ...customStandards]

  const toggleStandard = (standard: Standard) => {
    if (selectedStandards.find(s => s.id === standard.id)) {
      setSelectedStandards(selectedStandards.filter(s => s.id !== standard.id))
    } else {
      setSelectedStandards([...selectedStandards, standard])
    }
  }

  const handleAddCustomStandard = () => {
    if (!customCode.trim() || !customDesc.trim()) return
    const newStandard: Standard = {
      id: `custom-${Date.now()}`,
      code: customCode.trim(),
      description: customDesc.trim(),
      category: customCategory.trim() || 'Custom',
    }
    setCustomStandards([...customStandards, newStandard])
    setCustomCode('')
    setCustomDesc('')
    setCustomCategory('')
    setAddStandardOpen(false)
  }

  const aiRubricSteps = ['Analyzing selected standards', 'Mapping to learning objectives', 'Generating rubric criteria', 'Applying weights and levels', 'Rubric ready']

  const goToRubricStep = async () => {
    if (selectedStandards.length === 0) return
    setAiGeneratingRubric(true)
    setAiRubricStep(0)
    for (let i = 0; i < aiRubricSteps.length; i++) {
      setAiRubricStep(i)
      await new Promise(r => setTimeout(r, 600))
    }
    const generated = generateRubricFromStandards(selectedStandards)
    setRubric(generated)
    setAiGeneratingRubric(false)
    setStep(3)
  }

  const aiCheckpointSteps = ['Analyzing project goals', 'Identifying natural checkpoints', 'Suggesting submission stages', 'Setting suggested due dates', 'Checkpoints ready']

  const runSuggestCheckpoints = async () => {
    setAiSuggestingCheckpoints(true)
    setAiCheckpointStep(0)
    for (let i = 0; i < aiCheckpointSteps.length; i++) {
      setAiCheckpointStep(i)
      await new Promise(r => setTimeout(r, 500))
    }
    const suggested = suggestCheckpointsFromProject(title, description)
    setMilestones(suggested)
    setAiSuggestingCheckpoints(false)
  }

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: `m${milestones.length + 1}`,
      name: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      order: milestones.length + 1
    }])
  }

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = await readFileAsDataUrl(file)
    setAttachments(a => [...a, { id: `att-${Date.now()}`, name: file.name, type: 'image', url }])
    e.target.value = ''
  }

  const handleAddDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const maxSize = 800 * 1024
    if (file.size <= maxSize) {
      const url = await readFileAsDataUrl(file)
      setAttachments(a => [...a, { id: `att-${Date.now()}`, name: file.name, type: 'document', url }])
    } else {
      setAttachments(a => [...a, { id: `att-${Date.now()}`, name: file.name, type: 'document', url: '' }])
    }
    e.target.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id))
  }

  const handleCreate = () => {
    if (!user) return
    
    const project = createProject({
      title,
      description,
      teacherId: user.id,
      standards: selectedStandards,
      rubric,
      milestones,
      taskType,
      status: 'draft',
      attachments: attachments.length > 0 ? attachments : undefined
    })
    
    router.push(`/teacher/projects/${project.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mt-2">Create New Project</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Project Details</CardTitle>
              <CardDescription>Basic information about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Persuasive Essay on Climate Change"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project goals and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Task Type</Label>
                <RadioGroup value={taskType} onValueChange={(v) => setTaskType(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="font-normal">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="group" />
                    <Label htmlFor="group" className="font-normal">Group</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Images or documents</Label>
                <p className="text-xs text-muted-foreground">Add images or documents (PDF, etc.) that relate to this project. Students will see these in the project overview.</p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
                    <ImagePlus className="h-4 w-4" />
                    Add image
                    <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
                  </label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
                    <FileText className="h-4 w-4" />
                    Add document
                    <input type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden" onChange={handleAddDocument} />
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                        {att.type === 'image' && att.url ? (
                          <img src={att.url} alt={att.name} className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span className="text-sm truncate flex-1">{att.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(att.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => setStep(2)} disabled={!title}>Next: Choose Standards</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Step 2: Choose Learning Standards</CardTitle>
                  <CardDescription>Select from the library or add your own learning standards</CardDescription>
                </div>
                <Dialog open={addStandardOpen} onOpenChange={setAddStandardOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add learning standard
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add learning standard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Code (e.g. CCSS.ELA.W.9-10.5)</Label>
                        <Input
                          placeholder="Standard code"
                          value={customCode}
                          onChange={(e) => setCustomCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="What students should be able to do..."
                          value={customDesc}
                          onChange={(e) => setCustomDesc(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category (e.g. Writing, Reading, Science)</Label>
                        <Input
                          placeholder="Category"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddCustomStandard} disabled={!customCode.trim() || !customDesc.trim()}>
                        Add standard
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiGeneratingRubric ? (
                <div className="space-y-4 py-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">AI is generating your rubric from the selected standards</span>
                  </div>
                  <AIProcessSteps currentStep={aiRubricStep} steps={aiRubricSteps} />
                </div>
              ) : (
                <>
                  {allStandardsList.map(standard => (
                    <div key={standard.id} className="flex items-start space-x-2 p-3 border rounded">
                      <Checkbox
                        checked={!!selectedStandards.find(s => s.id === standard.id)}
                        onCheckedChange={() => toggleStandard(standard)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{standard.code}</p>
                        <p className="text-sm text-muted-foreground">{standard.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{standard.category}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={goToRubricStep} disabled={selectedStandards.length === 0}>
                      Next: AI generates rubric
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Step 3: Review Rubric</CardTitle>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <Sparkles className="h-3 w-3" />
                  AI-generated
                </span>
              </div>
              <CardDescription>Rubric generated by AI from your selected learning standards. Edit if needed, then continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rubric.map(criterion => (
                <div key={criterion.id} className="p-4 border rounded">
                  <h3 className="font-semibold">{criterion.name}</h3>
                  <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Weight: {criterion.weight}%</p>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>Next: Set Milestones</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Set Checkpoints (Milestones)</CardTitle>
              <CardDescription>Create checkpoints for student submissions. Use AI to suggest checkpoints from your project details, or add your own.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestingCheckpoints ? (
                <div className="space-y-4 py-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">AI is suggesting checkpoints from your project</span>
                  </div>
                  <AIProcessSteps currentStep={aiCheckpointStep} steps={aiCheckpointSteps} />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">AI-suggested checkpoints</p>
                      <p className="text-xs text-blue-700">Based on your project title and description</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={runSuggestCheckpoints}>
                      Suggest checkpoints
                    </Button>
                  </div>
                  {milestones.map((milestone, index) => (
                <div key={milestone.id} className="p-4 border rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <Label>Milestone {index + 1}</Label>
                    {milestones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Milestone name"
                    value={milestone.name}
                    onChange={(e) => {
                      const updated = [...milestones]
                      updated[index].name = e.target.value
                      setMilestones(updated)
                    }}
                  />
                  <Textarea
                    placeholder="Description"
                    value={milestone.description}
                    onChange={(e) => {
                      const updated = [...milestones]
                      updated[index].description = e.target.value
                      setMilestones(updated)
                    }}
                    rows={2}
                  />
                  <Input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => {
                      const updated = [...milestones]
                      updated[index].dueDate = e.target.value
                      setMilestones(updated)
                    }}
                  />
                </div>
              ))}
                  <Button variant="outline" onClick={addMilestone}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button onClick={handleCreate}>Create Project</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function NewProject() {
  return (
    <AuthGuard requiredRole="teacher">
      <NewProjectContent />
    </AuthGuard>
  )
}
