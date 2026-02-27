import type { Project, Class, Evidence, Feedback, StudentProgress, Standard, Flag, AIAnalysis, RubricCriterion, Milestone } from './types'
import {
  getDemoExtractionResult,
  rubricMapping,
  guidingPrompts,
  type RubricRow,
} from './demo-data'

// Built-in standards library
export const STANDARDS_LIBRARY: Standard[] = [
  { id: 'ccss-ela-1', code: 'CCSS.ELA-LITERACY.W.9-10.1', description: 'Write arguments to support claims', category: 'Writing' },
  { id: 'ccss-ela-2', code: 'CCSS.ELA-LITERACY.W.9-10.2', description: 'Write informative/explanatory texts', category: 'Writing' },
  { id: 'ccss-ela-3', code: 'CCSS.ELA-LITERACY.RL.9-10.1', description: 'Cite textual evidence', category: 'Reading' },
  { id: 'ccss-ela-4', code: 'CCSS.ELA-LITERACY.W.9-10.4', description: 'Produce clear and coherent writing', category: 'Writing' },
  { id: 'ngss-1', code: 'MS-PS1-1', description: 'Develop models to describe atomic composition', category: 'Science' },
  { id: 'ngss-2', code: 'MS-LS1-1', description: 'Conduct investigation to provide evidence', category: 'Science' },
]

// LocalStorage keys
const STORAGE_KEYS = {
  PROJECTS: 'eduflow_projects',
  CLASSES: 'eduflow_classes',
  EVIDENCE: 'eduflow_evidence',
  FEEDBACK: 'eduflow_feedback',
  PROGRESS: 'eduflow_progress',
  FLAGS: 'eduflow_flags',
  AI_ANALYSIS: 'eduflow_ai_analysis',
}

// Helper to safely access localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Data store with localStorage persistence
export const store = {
  get projects(): Project[] {
    return getFromStorage(STORAGE_KEYS.PROJECTS, [])
  },
  set projects(value: Project[]) {
    saveToStorage(STORAGE_KEYS.PROJECTS, value)
  },
  
  get classes(): Class[] {
    return getFromStorage(STORAGE_KEYS.CLASSES, [])
  },
  set classes(value: Class[]) {
    saveToStorage(STORAGE_KEYS.CLASSES, value)
  },
  
  get evidence(): Evidence[] {
    return getFromStorage(STORAGE_KEYS.EVIDENCE, [])
  },
  set evidence(value: Evidence[]) {
    saveToStorage(STORAGE_KEYS.EVIDENCE, value)
  },
  
  get feedback(): Feedback[] {
    return getFromStorage(STORAGE_KEYS.FEEDBACK, [])
  },
  set feedback(value: Feedback[]) {
    saveToStorage(STORAGE_KEYS.FEEDBACK, value)
  },
  
  get progress(): StudentProgress[] {
    return getFromStorage(STORAGE_KEYS.PROGRESS, [])
  },
  set progress(value: StudentProgress[]) {
    saveToStorage(STORAGE_KEYS.PROGRESS, value)
  },

  get flags(): Flag[] {
    return getFromStorage(STORAGE_KEYS.FLAGS, [])
  },
  set flags(value: Flag[]) {
    saveToStorage(STORAGE_KEYS.FLAGS, value)
  },

  get aiAnalysis(): AIAnalysis[] {
    return getFromStorage(STORAGE_KEYS.AI_ANALYSIS, [])
  },
  set aiAnalysis(value: AIAnalysis[]) {
    saveToStorage(STORAGE_KEYS.AI_ANALYSIS, value)
  },
}

/** AI-generated rubric from selected standards (demo: maps standards to criteria by category) */
export function generateRubricFromStandards(standards: Standard[]): RubricCriterion[] {
  const categories = [...new Set(standards.map(s => s.category))]
  const baseCriteria: RubricCriterion[] = [
    { id: 'c1', name: 'Thesis & Argument', description: 'Clear thesis with supporting arguments', weight: 30, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Strong, clear thesis' }, { score: 3, label: 'Proficient', description: 'Clear thesis with adequate support' }, { score: 2, label: 'Developing', description: 'Thesis present but needs development' }, { score: 1, label: 'Beginning', description: 'Unclear or missing thesis' }] },
    { id: 'c2', name: 'Evidence & Citations', description: 'Use of credible sources with proper citations', weight: 30, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Multiple credible sources' }, { score: 3, label: 'Proficient', description: 'Adequate sources with citations' }, { score: 2, label: 'Developing', description: 'Limited sources' }, { score: 1, label: 'Beginning', description: 'Missing or unreliable sources' }] },
    { id: 'c3', name: 'Organization & Structure', description: 'Clear organization with logical flow', weight: 20, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Excellent organization' }, { score: 3, label: 'Proficient', description: 'Clear organization' }, { score: 2, label: 'Developing', description: 'Some organizational issues' }, { score: 1, label: 'Beginning', description: 'Lacks clear organization' }] },
    { id: 'c4', name: 'Writing Mechanics', description: 'Grammar, spelling, and punctuation', weight: 20, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Few to no errors' }, { score: 3, label: 'Proficient', description: 'Minor errors' }, { score: 2, label: 'Developing', description: 'Several errors' }, { score: 1, label: 'Beginning', description: 'Frequent errors' }] },
  ]
  if (categories.includes('Science')) {
    baseCriteria.push({ id: 'c5', name: 'Scientific Reasoning', description: 'Hypothesis, method, and evidence-based conclusions', weight: 25, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Clear hypothesis and method' }, { score: 3, label: 'Proficient', description: 'Adequate scientific reasoning' }, { score: 2, label: 'Developing', description: 'Partial reasoning' }, { score: 1, label: 'Beginning', description: 'Missing or unclear' }] })
  }
  return baseCriteria.slice(0, categories.length > 1 ? 5 : 4).map((c, i) => ({ ...c, id: `c${i + 1}` }))
}

/** AI-suggested tasks (milestones) from project title & description */
export function suggestCheckpointsFromProject(title: string, description: string): Milestone[] {
  const text = `${title} ${description}`.toLowerCase()
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  if (/\bessay\b|persuasive|argument|writing\b|draft\b/.test(text)) {
    return [
      { id: 'm1', name: 'Initial Draft', description: 'Submit first draft with thesis statement and outline', dueDate: new Date(now + 7 * day).toISOString().split('T')[0], order: 1 },
      { id: 'm2', name: 'Peer Review', description: 'Submit revised draft after peer or self feedback', dueDate: new Date(now + 14 * day).toISOString().split('T')[0], order: 2 },
      { id: 'm3', name: 'Final Submission', description: 'Submit polished final version', dueDate: new Date(now + 21 * day).toISOString().split('T')[0], order: 3 },
    ]
  }
  if (/\binvestigation\b|science\b|experiment\b|hypothesis\b/.test(text)) {
    return [
      { id: 'm1', name: 'Proposal & Hypothesis', description: 'Submit research question and hypothesis', dueDate: new Date(now + 5 * day).toISOString().split('T')[0], order: 1 },
      { id: 'm2', name: 'Method & Data', description: 'Submit method and initial data or results', dueDate: new Date(now + 12 * day).toISOString().split('T')[0], order: 2 },
      { id: 'm3', name: 'Analysis & Conclusion', description: 'Submit analysis and conclusions', dueDate: new Date(now + 19 * day).toISOString().split('T')[0], order: 3 },
    ]
  }
  if (/\bpresentation\b|project\b/.test(text)) {
    return [
      { id: 'm1', name: 'Outline & Research', description: 'Submit outline and key sources', dueDate: new Date(now + 7 * day).toISOString().split('T')[0], order: 1 },
      { id: 'm2', name: 'Draft / Script', description: 'Submit draft or presentation script', dueDate: new Date(now + 14 * day).toISOString().split('T')[0], order: 2 },
      { id: 'm3', name: 'Final Deliverable', description: 'Submit final presentation or project', dueDate: new Date(now + 21 * day).toISOString().split('T')[0], order: 3 },
    ]
  }
  return [
    { id: 'm1', name: 'Task 1', description: 'First submission task', dueDate: new Date(now + 7 * day).toISOString().split('T')[0], order: 1 },
    { id: 'm2', name: 'Task 2', description: 'Mid-project review', dueDate: new Date(now + 14 * day).toISOString().split('T')[0], order: 2 },
    { id: 'm3', name: 'Final Task', description: 'Final submission', dueDate: new Date(now + 21 * day).toISOString().split('T')[0], order: 3 },
  ]
}

// Helper functions
export function createProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
  const newProject: Project = {
    ...project,
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const projects = store.projects
  projects.push(newProject)
  store.projects = projects
  return newProject
}

export function getProjectsByTeacher(teacherId: string): Project[] {
  return store.projects.filter(p => p.teacherId === teacherId)
}

export function getProject(id: string): Project | undefined {
  return store.projects.find(p => p.id === id)
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projects = store.projects
  const index = projects.findIndex(p => p.id === id)
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updates }
    store.projects = projects
    return projects[index]
  }
  return undefined
}

export function createClass(classData: Omit<Class, 'id' | 'joinCode'>): Class {
  const newClass: Class = {
    ...classData,
    id: `class-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
  }
  const classes = store.classes
  classes.push(newClass)
  store.classes = classes
  return newClass
}

export function getClassesByTeacher(teacherId: string): Class[] {
  return store.classes.filter(c => c.teacherId === teacherId)
}

export function getClassesByStudent(studentId: string): Class[] {
  return store.classes.filter(c => c.studentIds.includes(studentId))
}

export function joinClass(classId: string, studentId: string): boolean {
  const classes = store.classes
  const classData = classes.find(c => c.id === classId)
  if (classData && !classData.studentIds.includes(studentId)) {
    classData.studentIds.push(studentId)
    store.classes = classes
    return true
  }
  return false
}

export function submitEvidence(evidence: Omit<Evidence, 'id' | 'submittedAt' | 'version'>): Evidence {
  const existingEvidence = store.evidence.filter(
    e => e.studentId === evidence.studentId && 
        e.projectId === evidence.projectId && 
        e.milestoneId === evidence.milestoneId
  )
  
  const newEvidence: Evidence = {
    ...evidence,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    submittedAt: new Date().toISOString(),
    version: existingEvidence.length + 1,
    extractedText: evidence.content, // In production, this would be from PDF/DOCX parser
  }
  const evidences = store.evidence
  evidences.push(newEvidence)
  store.evidence = evidences
  
  // AI Analysis Pipeline
  runAIAnalysisPipeline(newEvidence)
  
  // Update progress
  updateProgress(evidence.studentId, evidence.projectId, evidence.milestoneId)
  
  // Check for flags
  checkAndCreateFlags(evidence.studentId, evidence.projectId)
  
  return newEvidence
}

// Map project rubric criterion to demo rubric row (by name or index)
function getDemoRowForCriterion(criterion: { name: string }, index: number): RubricRow {
  const name = criterion.name.toLowerCase()
  if (name.includes('writing') || name.includes('mechanics')) {
    return rubricMapping[4] // Writing Mechanics
  }
  return rubricMapping[Math.min(index, rubricMapping.length - 1)]
}

// AI Analysis Pipeline (mimics real AI using demo data)
function runAIAnalysisPipeline(evidence: Evidence) {
  const project = getProject(evidence.projectId)
  if (!project) return
  
  // Module 1: Evidence Extraction — use demo extraction (key claims, concepts, structure)
  const extractedData = extractEvidence(evidence.extractedText || evidence.content)
  
  // Module 2 & 3: Rubric Mapping & Gap Detection — use demo rubric rows
  const analyses = store.aiAnalysis
  const feedbacks = store.feedback
  
  project.rubric.forEach((criterion, index) => {
    const demoRow = getDemoRowForCriterion(criterion, index)
    const score = demoRow.score
    const maxScore = demoRow.maxScore
    const alignmentScore = score / maxScore
    const confidence = 0.85 + Math.random() * 0.1 // 0.85–0.95 for demo consistency
    
    const analysis: AIAnalysis = {
      id: `analysis-${Date.now()}-${criterion.id}`,
      evidenceId: evidence.id,
      criterionId: criterion.id,
      keyClaims: extractedData.keyClaims,
      concepts: extractedData.concepts,
      argumentStructure: extractedData.argumentStructure,
      alignmentScore,
      confidence,
      explanation: `${demoRow.evidenceFound} ${demoRow.gap ? `Gap: ${demoRow.gap}` : ''}`.trim(),
      generatedAt: new Date().toISOString(),
    }
    analyses.push(analysis)
    
    // Module 4: Feedback Generation — use demo row (evidence, gap, score) and guiding prompts
    const strengths = score >= 3 ? [demoRow.evidenceFound] : []
    const gaps = demoRow.gap ? [demoRow.gap] : []
    const matchingPrompt = guidingPrompts.find((p) => p.targetGap === demoRow.criterion)
    const reflectionPrompt =
      matchingPrompt?.prompt ??
      `How might you strengthen your ${criterion.name.toLowerCase()} in your next revision?`

    const feedback: Feedback = {
      id: `fb-${Date.now()}-${criterion.id}`,
      evidenceId: evidence.id,
      criterionId: criterion.id,
      score,
      strengths: strengths.length > 0 ? strengths : generateStrengths(score, criterion.name),
      gaps: gaps.length > 0 ? gaps : generateGaps(score, criterion.name),
      missingStandards: score < 3 ? ['Consider addressing counterarguments', 'Add more specific evidence'] : [],
      nextSteps: demoRow.gap
        ? `Focus on: ${demoRow.gap} Use the reflection prompt below to plan your revision.`
        : generateNextSteps(score, criterion.name),
      reflectionPrompt,
      generatedAt: new Date().toISOString(),
    }
    feedbacks.push(feedback)
  })
  
  store.aiAnalysis = analyses
  store.feedback = feedbacks
}

// Module 1: Evidence Extraction — uses demo data to mimic real AI extraction
function extractEvidence(_text: string) {
  const demo = getDemoExtractionResult()
  return {
    keyClaims: demo.keyClaims,
    concepts: demo.concepts,
    argumentStructure: demo.argumentStructure,
  }
}

function generateStrengths(score: number, criterionName: string): string[] {
  const strengths = [
    [`Strong ${criterionName.toLowerCase()} demonstrated`, 'Excellent use of examples', 'Clear and coherent presentation'],
    [`Good ${criterionName.toLowerCase()} shown`, 'Adequate supporting details', 'Organized structure'],
    [`Basic ${criterionName.toLowerCase()} present`, 'Some relevant examples', 'Attempts at organization'],
    [`Minimal ${criterionName.toLowerCase()}`, 'Limited examples', 'Needs structure']
  ]
  return strengths[4 - score] || strengths[3]
}

function generateGaps(score: number, criterionName: string): string[] {
  if (score >= 4) return []
  const gaps = [
    [`${criterionName} needs significant development`, 'Missing key elements', 'Lacks clarity'],
    [`${criterionName} needs improvement`, 'Could use more detail', 'Some unclear sections'],
    [`${criterionName} could be stronger`, 'Minor improvements needed']
  ]
  return gaps[4 - score - 1] || []
}

function generateNextSteps(score: number, criterionName: string): string {
  const steps = [
    `Focus on developing your ${criterionName.toLowerCase()} with specific examples and clear explanations.`,
    `Strengthen your ${criterionName.toLowerCase()} by adding more detailed analysis and evidence.`,
    `Enhance your ${criterionName.toLowerCase()} with deeper insights and connections.`,
    `Excellent work! Consider exploring advanced applications of ${criterionName.toLowerCase()}.`
  ]
  return steps[score - 1] || steps[0]
}

function generateReflectionPrompt(score: number, criterionName: string): string {
  const prompts = [
    `What specific strategies could you use to improve your ${criterionName.toLowerCase()}?`,
    `How might you strengthen the ${criterionName.toLowerCase()} in your next revision?`,
    `What additional evidence or examples could enhance your ${criterionName.toLowerCase()}?`,
    `How could you extend your ${criterionName.toLowerCase()} to explore more complex ideas?`
  ]
  return prompts[score - 1] || prompts[0]
}

function generateFeedback(evidence: Evidence) {
  // Legacy function - now handled by runAIAnalysisPipeline
  runAIAnalysisPipeline(evidence)
}

function updateProgress(studentId: string, projectId: string, milestoneId: string) {
  const allProgress = store.progress
  let progress = allProgress.find(p => p.studentId === studentId && p.projectId === projectId)
  
  if (!progress) {
    progress = {
      studentId,
      projectId,
      status: 'green',
      completedMilestones: [],
      lastUpdated: new Date().toISOString(),
      overallScore: 0,
      submissionCount: 0,
      lastActivityDate: new Date().toISOString(),
    }
    allProgress.push(progress)
  }
  
  if (!progress.completedMilestones.includes(milestoneId)) {
    progress.completedMilestones.push(milestoneId)
  }
  
  progress.lastUpdated = new Date().toISOString()
  progress.lastActivityDate = new Date().toISOString()
  progress.submissionCount = (progress.submissionCount || 0) + 1
  
  // Calculate overall score and confidence
  const evidences = store.evidence.filter(e => e.studentId === studentId && e.projectId === projectId)
  const feedbacks = evidences.flatMap(e => store.feedback.filter(f => f.evidenceId === e.id))
  const analyses = evidences.flatMap(e => store.aiAnalysis.filter(a => a.evidenceId === e.id))
  
  if (feedbacks.length > 0) {
    progress.overallScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length
  }
  
  if (analyses.length > 0) {
    progress.averageConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
  }
  
  // Update status based on score
  if (progress.overallScore < 2.5) {
    progress.status = 'red'
    progress.flagReason = 'Low performance score (< 60%)'
  } else if (progress.overallScore < 3.5) {
    progress.status = 'yellow'
    progress.flagReason = 'Needs improvement (60-75%)'
  } else {
    progress.status = 'green'
    progress.flagReason = undefined
  }
  
  store.progress = allProgress
}

// Module 5: Flag Engine (Rule-Based)
function checkAndCreateFlags(studentId: string, projectId: string) {
  const progress = store.progress.find(p => p.studentId === studentId && p.projectId === projectId)
  const project = getProject(projectId)
  if (!progress || !project) return
  
  const flags = store.flags
  const existingFlags = flags.filter(f => f.studentId === studentId && f.projectId === projectId && !f.resolved)
  
  // Rule 1: Low Score Flag
  if (progress.overallScore < 2.5 && !existingFlags.find(f => f.flagType === 'low_score')) {
    flags.push({
      id: `flag-${Date.now()}-low-score`,
      studentId,
      projectId,
      flagType: 'low_score',
      reason: `Average score of ${progress.overallScore.toFixed(1)}/4 is below threshold`,
      severity: progress.overallScore < 2 ? 'high' : 'medium',
      suggestedIntervention: 'Schedule one-on-one conference to review rubric expectations and provide targeted support',
      createdAt: new Date().toISOString(),
      resolved: false,
    })
  }
  
  // Rule 2: Missed Milestone Flag
  const now = new Date()
  project.milestones.forEach(milestone => {
    const dueDate = new Date(milestone.dueDate)
    if (dueDate < now && !progress.completedMilestones.includes(milestone.id)) {
      if (!existingFlags.find(f => f.flagType === 'missed_milestone' && f.reason.includes(milestone.name))) {
        flags.push({
          id: `flag-${Date.now()}-missed-${milestone.id}`,
          studentId,
          projectId,
          flagType: 'missed_milestone',
          reason: `Missed milestone: ${milestone.name} (due ${milestone.dueDate})`,
          severity: 'high',
          suggestedIntervention: `Send reminder about ${milestone.name} and offer extension if needed`,
          createdAt: new Date().toISOString(),
          resolved: false,
        })
      }
    }
  })
  
  // Rule 3: No Activity Flag
  if (progress.lastActivityDate) {
    const daysSinceActivity = (now.getTime() - new Date(progress.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceActivity > 5 && !existingFlags.find(f => f.flagType === 'no_activity')) {
      flags.push({
        id: `flag-${Date.now()}-no-activity`,
        studentId,
        projectId,
        flagType: 'no_activity',
        reason: `No submissions in ${Math.floor(daysSinceActivity)} days`,
        severity: daysSinceActivity > 10 ? 'high' : 'medium',
        suggestedIntervention: 'Check in with student about barriers to progress and offer support',
        createdAt: new Date().toISOString(),
        resolved: false,
      })
    }
  }
  
  // Rule 4: Quality Drop Flag
  if (progress.submissionCount >= 2) {
    const recentEvidences = store.evidence
      .filter(e => e.studentId === studentId && e.projectId === projectId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 2)
    
    if (recentEvidences.length === 2) {
      const recentScores = recentEvidences.map(e => {
        const feedbacks = store.feedback.filter(f => f.evidenceId === e.id)
        return feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length : 0
      })
      
      if (recentScores[0] < recentScores[1] - 1 && !existingFlags.find(f => f.flagType === 'quality_drop')) {
        flags.push({
          id: `flag-${Date.now()}-quality-drop`,
          studentId,
          projectId,
          flagType: 'quality_drop',
          reason: `Recent submission quality dropped from ${recentScores[1].toFixed(1)} to ${recentScores[0].toFixed(1)}`,
          severity: 'medium',
          suggestedIntervention: 'Discuss recent challenges and review feedback from previous submission',
          createdAt: new Date().toISOString(),
          resolved: false,
        })
      }
    }
  }
  
  store.flags = flags
}

export function getStudentProgress(studentId: string, projectId: string): StudentProgress | undefined {
  return store.progress.find(p => p.studentId === studentId && p.projectId === projectId)
}

export function getProgressByProject(projectId: string): StudentProgress[] {
  return store.progress.filter(p => p.projectId === projectId)
}

export function getEvidenceByStudent(studentId: string, projectId: string): Evidence[] {
  return store.evidence.filter(e => e.studentId === studentId && e.projectId === projectId)
}

export function getEvidenceByProject(projectId: string): Evidence[] {
  return store.evidence.filter(e => e.projectId === projectId)
}

export function getFeedbackByEvidence(evidenceId: string): Feedback[] {
  return store.feedback.filter(f => f.evidenceId === evidenceId)
}

export function getAIAnalysisByEvidence(evidenceId: string): AIAnalysis[] {
  return store.aiAnalysis.filter(a => a.evidenceId === evidenceId)
}

export function getFlagsByStudent(studentId: string, projectId: string): Flag[] {
  return store.flags.filter(f => f.studentId === studentId && f.projectId === projectId && !f.resolved)
}

export function getFlagsByProject(projectId: string): Flag[] {
  return store.flags.filter(f => f.projectId === projectId && !f.resolved)
}

export function resolveFlag(flagId: string): void {
  const flags = store.flags
  const flag = flags.find(f => f.id === flagId)
  if (flag) {
    flag.resolved = true
    store.flags = flags
  }
}

// Utility functions for data management
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

const DEMO_RUBRIC = [
  { id: 'c1', name: 'Thesis & Argument', description: 'Clear thesis with supporting arguments', weight: 30, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Strong thesis' }, { score: 3, label: 'Proficient', description: 'Clear thesis' }, { score: 2, label: 'Developing', description: 'Needs development' }, { score: 1, label: 'Beginning', description: 'Unclear thesis' }] },
  { id: 'c2', name: 'Evidence & Citations', description: 'Credible sources and citations', weight: 30, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Multiple sources' }, { score: 3, label: 'Proficient', description: 'Adequate sources' }, { score: 2, label: 'Developing', description: 'Limited sources' }, { score: 1, label: 'Beginning', description: 'Missing sources' }] },
  { id: 'c3', name: 'Organization & Structure', description: 'Clear organization', weight: 20, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Excellent flow' }, { score: 3, label: 'Proficient', description: 'Clear' }, { score: 2, label: 'Developing', description: 'Some issues' }, { score: 1, label: 'Beginning', description: 'Lacks organization' }] },
  { id: 'c4', name: 'Writing Mechanics', description: 'Grammar and punctuation', weight: 20, maxScore: 4, levels: [{ score: 4, label: 'Excellent', description: 'Few errors' }, { score: 3, label: 'Proficient', description: 'Minor errors' }, { score: 2, label: 'Developing', description: 'Several errors' }, { score: 1, label: 'Beginning', description: 'Frequent errors' }] },
]

function demoMilestones(daysFromNow: number[]) {
  return daysFromNow.map((days, i) => ({
    id: `m${i + 1}`,
    name: ['Initial Draft', 'Revision', 'Final Submission'][i] || `Task ${i + 1}`,
    description: `Milestone ${i + 1}`,
    dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    order: i + 1
  }))
}

export function seedDemoData(opts?: { force?: boolean }): void {
  if (!opts?.force && store.projects.length > 0) return
  if (opts?.force) clearAllData()
  
  const teacherId = 't1'
  const now = new Date()
  const nowIso = now.toISOString()
  const day = 24 * 60 * 60 * 1000
  const pastDate = new Date(now.getTime() - 2 * day).toISOString().split('T')[0]

  // —— Projects ——
  // p1: 4 milestones showcasing all states for student s1 — Completed, Past-due, Active, Inactive
  const p1Milestones: Milestone[] = [
    { id: 'm1', name: 'Initial Draft', description: 'Submit first draft with thesis', dueDate: new Date(now.getTime() - 7 * day).toISOString().split('T')[0], order: 1 },
    { id: 'm2', name: 'Peer Review', description: 'Submit revised draft after feedback', dueDate: new Date(now.getTime() - 3 * day).toISOString().split('T')[0], order: 2 },
    { id: 'm3', name: 'Revision', description: 'Submit polished revision', dueDate: new Date(now.getTime() + 7 * day).toISOString().split('T')[0], order: 3 },
    { id: 'm4', name: 'Final Submission', description: 'Submit final version', dueDate: new Date(now.getTime() + 21 * day).toISOString().split('T')[0], order: 4, opensOn: '2026-04-23' },
  ]
  const p1 = createProject({
    title: 'Persuasive Essay on Climate Change',
    description: 'Write a 5-paragraph persuasive essay arguing for or against climate change policies. Use evidence from at least 3 credible sources.',
    teacherId,
    standards: [STANDARDS_LIBRARY[0], STANDARDS_LIBRARY[2]],
    rubric: DEMO_RUBRIC,
    milestones: p1Milestones,
    taskType: 'individual',
    status: 'published'
  })
  const p2 = createProject({
    title: 'Research Paper: Civil Rights Movement',
    description: 'Research and write a 4–6 page paper on a key figure or event of the Civil Rights Movement. Include primary and secondary sources.',
    teacherId,
    standards: [STANDARDS_LIBRARY[1], STANDARDS_LIBRARY[2]],
    rubric: DEMO_RUBRIC,
    milestones: demoMilestones([10, 20, 28]),
    taskType: 'individual',
    status: 'published'
  })
  const p3 = createProject({
    title: 'Science Lab: Chemical Reactions',
    description: 'Design and document a simple chemical reaction experiment. Hypothesis, method, data, and conclusion required.',
    teacherId,
    standards: [STANDARDS_LIBRARY[4], STANDARDS_LIBRARY[5]],
    rubric: DEMO_RUBRIC,
    milestones: demoMilestones([5, 12, 19]),
    taskType: 'individual',
    status: 'published'
  })
  const p4 = createProject({
    title: 'Creative Writing Portfolio',
    description: 'Submit three short pieces: narrative, descriptive, and reflective. Revise based on feedback.',
    teacherId,
    standards: [STANDARDS_LIBRARY[0], STANDARDS_LIBRARY[3]],
    rubric: DEMO_RUBRIC,
    milestones: demoMilestones([7, 14]),
    taskType: 'individual',
    status: 'published'
  })

  // p5: Community Impact Documentary — PBL with all task states (Completed, Past-due, Active, Inactive)
  const p5Milestones: Milestone[] = [
    { id: 'm1', name: 'Research & Proposal', description: 'Submit research on local issue and documentary proposal', dueDate: new Date(now.getTime() - 7 * day).toISOString().split('T')[0], order: 1 },
    { id: 'm2', name: 'Script & Storyboard', description: 'Submit script and storyboard for documentary', dueDate: new Date(now.getTime() - 3 * day).toISOString().split('T')[0], order: 2 },
    { id: 'm3', name: 'Rough Cut', description: 'Submit rough cut of documentary (5–8 min)', dueDate: new Date(now.getTime() + 7 * day).toISOString().split('T')[0], order: 3 },
    { id: 'm4', name: 'Final Cut & Reflection', description: 'Submit final documentary and written reflection', dueDate: new Date(now.getTime() + 21 * day).toISOString().split('T')[0], order: 4, opensOn: '2026-05-01' },
  ]
  const p5 = createProject({
    title: 'Community Impact Documentary',
    description: 'Create a 5–8 minute documentary exploring a local community issue. Include research, script, rough cut, and final cut with reflection on impact.',
    teacherId,
    standards: [STANDARDS_LIBRARY[1], STANDARDS_LIBRARY[2]],
    rubric: DEMO_RUBRIC,
    milestones: p5Milestones,
    taskType: 'individual',
    status: 'published'
  })

  // p6: Sustainable Design Challenge — PBL with all task states
  const p6Milestones: Milestone[] = [
    { id: 'm1', name: 'Problem Definition & Research', description: 'Submit problem statement and background research', dueDate: new Date(now.getTime() - 5 * day).toISOString().split('T')[0], order: 1 },
    { id: 'm2', name: 'Prototype Design', description: 'Submit design sketches and material list', dueDate: new Date(now.getTime() - 2 * day).toISOString().split('T')[0], order: 2 },
    { id: 'm3', name: 'Build & Test', description: 'Submit prototype build log and testing results', dueDate: new Date(now.getTime() + 10 * day).toISOString().split('T')[0], order: 3 },
    { id: 'm4', name: 'Final Presentation', description: 'Submit presentation and improvement plan', dueDate: new Date(now.getTime() + 24 * day).toISOString().split('T')[0], order: 4, opensOn: '2026-05-15' },
  ]
  const p6 = createProject({
    title: 'Sustainable Design Challenge',
    description: 'Design a sustainable solution for a school or community problem. Complete problem research, prototype design, build and test, then present your solution.',
    teacherId,
    standards: [STANDARDS_LIBRARY[4], STANDARDS_LIBRARY[5]],
    rubric: DEMO_RUBRIC,
    milestones: p6Milestones,
    taskType: 'individual',
    status: 'published'
  })

  // —— Classes ——
  const c1 = createClass({ name: 'Period 1 English', teacherId, studentIds: ['s1', 's2', 's3'], projectIds: [] })
  const c2 = createClass({ name: 'Period 3 English', teacherId, studentIds: ['s1', 's2', 's4'], projectIds: [] })
  const c3 = createClass({ name: 'Science 101', teacherId, studentIds: ['s2', 's3', 's4'], projectIds: [] })

  assignProjectToClass(c1.id, p1.id)
  assignProjectToClass(c1.id, p2.id)
  assignProjectToClass(c1.id, p5.id)
  assignProjectToClass(c2.id, p1.id)
  assignProjectToClass(c2.id, p4.id)
  assignProjectToClass(c2.id, p6.id)
  assignProjectToClass(c3.id, p3.id)

  // —— Evidence, Feedback, Progress, Flags (dummy entries for full dashboard) ——
  const evidences: Evidence[] = []
  const feedbacks: Feedback[] = []
  const progressList: StudentProgress[] = []
  const flagsList: Flag[] = []
  const analyses: AIAnalysis[] = []
  const extraction = getDemoExtractionResult()

  let evidenceCounter = 0
  const addEvidenceAndFeedback = (
    studentId: string,
    projectId: string,
    milestoneId: string,
    content: string,
    scores: number[] // per criterion, 1–4
  ) => {
    const proj = getProject(projectId)!
    evidenceCounter += 1
    const evId = `ev-${Date.now()}-${evidenceCounter}-${studentId}-${milestoneId}`
    const submittedAt = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
    evidences.push({
      id: evId,
      studentId,
      projectId,
      milestoneId,
      content,
      submittedAt,
      version: 1
    })
    proj.rubric.forEach((crit, i) => {
      const score = scores[i] ?? 3
      feedbacks.push({
        id: `fb-${evId}-${crit.id}`,
        evidenceId: evId,
        criterionId: crit.id,
        score,
        strengths: score >= 3 ? ['Good work'] : [],
        gaps: score < 3 ? ['Could improve'] : [],
        missingStandards: [],
        nextSteps: 'Keep revising.',
        reflectionPrompt: 'What would you do differently?',
        generatedAt: submittedAt
      })
      analyses.push({
        id: `a-${evId}-${crit.id}`,
        evidenceId: evId,
        criterionId: crit.id,
        keyClaims: extraction.keyClaims,
        concepts: extraction.concepts,
        argumentStructure: extraction.argumentStructure,
        alignmentScore: score / 4,
        confidence: 0.9,
        explanation: 'Aligned with criterion.',
        generatedAt: submittedAt
      })
    })
  }

  // p1: s1 has m1 only (completed); m2 past-due, m3 active, m4 inactive — showcases all task states
  addEvidenceAndFeedback('s1', p1.id, 'm1', 'Climate change requires policy action. Evidence from IPCC...', [3, 3, 3, 3])
  addEvidenceAndFeedback('s2', p1.id, 'm1', 'My argument is that renewable energy can replace fossil fuels...', [2, 2, 3, 2])
  addEvidenceAndFeedback('s3', p1.id, 'm1', 'First draft on climate policy.', [3, 3, 2, 3])
  // p2: s1, s2 with different scores (one low for flag)
  addEvidenceAndFeedback('s1', p2.id, 'm1', 'Research on Martin Luther King Jr. and nonviolent resistance.', [4, 4, 3, 4])
  addEvidenceAndFeedback('s2', p2.id, 'm1', 'Short draft.', [1, 2, 2, 1])
  addEvidenceAndFeedback('s3', p2.id, 'm1', 'Civil rights paper draft.', [3, 3, 3, 3])
  // p3: s2, s3, s4
  addEvidenceAndFeedback('s2', p3.id, 'm1', 'Hypothesis: vinegar and baking soda will produce CO2.', [3, 3, 3, 3])
  addEvidenceAndFeedback('s3', p3.id, 'm1', 'Lab report draft.', [4, 3, 4, 4])
  addEvidenceAndFeedback('s4', p3.id, 'm1', 'Experiment documentation.', [3, 3, 3, 3])
  // p5: Community Impact Documentary — s1 has m1 (Task 1) completed; m2 past-due, m3 active, m4 inactive
  addEvidenceAndFeedback('s1', p5.id, 'm1', 'Research on food insecurity in our community. Documentary will focus on local food bank.', [3, 3, 3, 3])
  addEvidenceAndFeedback('s2', p5.id, 'm1', 'Proposal: Documentary on youth mental health and school support.', [4, 3, 4, 3])
  // p6: Sustainable Design Challenge — s2 has m1 (Task 1) completed; m2 past-due, m3 active, m4 inactive
  addEvidenceAndFeedback('s2', p6.id, 'm1', 'Problem: Cafeteria food waste. Research on composting and student behavior.', [3, 4, 3, 3])
  addEvidenceAndFeedback('s4', p6.id, 'm1', 'Design challenge: Solar-powered phone charging station for common areas.', [3, 3, 2, 3])

  const key = (s: string, p: string) => `${s}-${p}`
  const progressByKey = new Map<string, StudentProgress>()
  evidences.forEach(ev => {
    const k = key(ev.studentId, ev.projectId)
    let progress = progressByKey.get(k)
    if (!progress) {
      progress = {
        studentId: ev.studentId,
        projectId: ev.projectId,
        status: 'green',
        completedMilestones: [],
        lastUpdated: ev.submittedAt,
        overallScore: 0,
        submissionCount: 0,
        lastActivityDate: ev.submittedAt
      }
      progressByKey.set(k, progress)
      progressList.push(progress)
    }
    if (!progress.completedMilestones.includes(ev.milestoneId)) progress.completedMilestones.push(ev.milestoneId)
    progress.submissionCount += 1
    if (new Date(ev.submittedAt) > new Date(progress.lastActivityDate!)) progress.lastActivityDate = ev.submittedAt
    progress.lastUpdated = ev.submittedAt
  })
  progressList.forEach(p => {
    const projectEvidences = evidences.filter(e => e.studentId === p.studentId && e.projectId === p.projectId)
    const fbs = feedbacks.filter(f => projectEvidences.some(e => e.id === f.evidenceId))
    if (fbs.length) p.overallScore = fbs.reduce((s, f) => s + f.score, 0) / fbs.length
    p.status = p.overallScore < 2.5 ? 'red' : p.overallScore < 3.5 ? 'yellow' : 'green'
    p.flagReason = p.status === 'red' ? 'Low performance score (< 60%)' : p.status === 'yellow' ? 'Needs improvement (60–75%)' : undefined
  })

  // Flags: low score, no activity, missed milestone (for full dashboard)
  flagsList.push({
    id: 'flag-1',
    studentId: 's2',
    projectId: p2.id,
    flagType: 'low_score',
    reason: 'Average score of 1.5/4 is below threshold',
    severity: 'high',
    suggestedIntervention: 'Schedule one-on-one to review rubric and provide support',
    createdAt: nowIso,
    resolved: false
  })
  flagsList.push({
    id: 'flag-2',
    studentId: 's4',
    projectId: p3.id,
    flagType: 'no_activity',
    reason: 'No submissions in 6 days',
    severity: 'medium',
    suggestedIntervention: 'Check in with student about barriers to progress',
    createdAt: nowIso,
    resolved: false
  })
  flagsList.push({
    id: 'flag-3',
    studentId: 's2',
    projectId: p1.id,
    flagType: 'missed_milestone',
    reason: 'Missed milestone: Peer Review (due ' + pastDate + ')',
    severity: 'high',
    suggestedIntervention: 'Send reminder and offer extension if needed',
    createdAt: nowIso,
    resolved: false
  })

  store.evidence = evidences
  store.feedback = feedbacks
  store.aiAnalysis = analyses
  store.progress = progressList
  store.flags = flagsList

  console.log('Demo data seeded: 6 projects, 3 classes, evidence & progress & flags')
}

// Helper to find class by join code
export function findClassByJoinCode(joinCode: string): Class | undefined {
  return store.classes.find(c => c.joinCode === joinCode.toUpperCase())
}

// Helper to get projects by IDs
export function getProjectsByIds(projectIds: string[]): Project[] {
  return projectIds.map(pid => store.projects.find(p => p.id === pid)).filter(Boolean) as Project[]
}

// Helper to assign project to class
export function assignProjectToClass(classId: string, projectId: string): boolean {
  const classes = store.classes
  const classData = classes.find(c => c.id === classId)
  
  if (classData && !classData.projectIds.includes(projectId)) {
    classData.projectIds.push(projectId)
    store.classes = classes
    return true
  }
  
  return false
}
