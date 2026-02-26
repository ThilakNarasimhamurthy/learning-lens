export interface Standard {
  id: string
  code: string
  description: string
  category: string
}

export interface RubricCriterion {
  id: string
  name: string
  description: string
  weight: number
  maxScore: number
  levels: {
    score: number
    label: string
    description: string
  }[]
}

export interface Milestone {
  id: string
  name: string
  description: string
  dueDate: string
  order: number
  reminderSent?: boolean
}

export interface ProjectAttachment {
  id: string
  name: string
  type: 'image' | 'document'
  url: string // data URL or blob URL for display
}

export interface Project {
  id: string
  title: string
  description: string
  teacherId: string
  standards: Standard[]
  rubric: RubricCriterion[]
  milestones: Milestone[]
  taskType: 'individual' | 'group'
  status: 'draft' | 'published'
  createdAt: string
  attachments?: ProjectAttachment[]
}

export interface Class {
  id: string
  name: string
  teacherId: string
  studentIds: string[]
  joinCode: string
  projectIds: string[]
}

export interface Evidence {
  id: string
  studentId: string
  projectId: string
  milestoneId: string
  content: string
  fileName?: string
  fileUrl?: string
  fileType?: 'text' | 'pdf' | 'docx'
  extractedText?: string
  reflection?: string
  submittedAt: string
  version: number
}

export interface AIAnalysis {
  id: string
  evidenceId: string
  criterionId: string
  keyClaims: string[]
  concepts: string[]
  argumentStructure?: string
  alignmentScore: number
  confidence: number
  explanation: string
  generatedAt: string
}

export interface Feedback {
  id: string
  evidenceId: string
  criterionId: string
  score: number
  strengths: string[]
  gaps: string[]
  missingStandards: string[]
  nextSteps: string
  reflectionPrompt: string
  generatedAt: string
}

export interface StudentProgress {
  studentId: string
  projectId: string
  status: 'green' | 'yellow' | 'red'
  completedMilestones: string[]
  lastUpdated: string
  overallScore: number
  averageConfidence?: number
  submissionCount: number
  flagReason?: string
  lastActivityDate?: string
}

export interface Flag {
  id: string
  studentId: string
  projectId: string
  flagType: 'low_score' | 'missed_milestone' | 'no_activity' | 'quality_drop'
  reason: string
  severity: 'low' | 'medium' | 'high'
  suggestedIntervention: string
  createdAt: string
  resolved: boolean
}

export interface RubricHeatmap {
  criterionId: string
  criterionName: string
  scores: number[]
  averageScore: number
  trend: 'improving' | 'declining' | 'stable'
}
