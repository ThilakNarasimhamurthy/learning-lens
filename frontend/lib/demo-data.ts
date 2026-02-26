// =============================================================
// Central dummy data used across every component in the demo
// =============================================================

// ---- Student being demonstrated ----
export const demoStudent = {
  id: "s-001",
  name: "Sarah Johnson",
  avatar: "SJ",
  class: "US History — Period 3",
  assignment: "Civil Rights Movement Essay",
  submittedAt: "Feb 23 2026, 10:42 AM",
}

// ---- Uploaded Essay (abridged preview) ----
export const essayText = `The Civil Rights Movement stands as one of the most transformative periods in American history. Beginning in the mid-1950s and extending through the late 1960s, this movement sought to end racial segregation and discrimination against African Americans and to secure legal recognition and federal protection of the citizenship rights enumerated in the Constitution.

Martin Luther King Jr. emerged as the most visible spokesperson and leader in the Civil Rights Movement from 1955 until his assassination in 1968. King advanced civil rights through nonviolence and civil disobedience, inspired by his Christian beliefs and the nonviolent activism of Mahatma Gandhi. His leadership was instrumental in ending the legal segregation of African-American citizens in the South and other areas of the nation.

The Civil Rights Act of 1964 was a landmark piece of legislation that outlawed discrimination based on race, color, religion, sex, or national origin. It prohibited unequal application of voter registration requirements, racial segregation in schools, employment, and public accommodations. The act was proposed by President John F. Kennedy in June 1963 and signed into law by President Lyndon B. Johnson on July 2, 1964.

The movement utilized a variety of tactics, including boycotts, sit-ins, marches, and voter registration drives. The Montgomery Bus Boycott of 1955-1956 was one of the first major campaigns, sparked by Rosa Parks' refusal to give up her seat. The Birmingham Campaign of 1963 drew national attention to the brutal treatment of protesters, which many historians argue directly influenced the passage of civil rights legislation.`

// ---- AI "run" stats (mimics real API usage) ----
export const demoAIStats = {
  processingTimeMs: 1847,
  tokensUsed: 2843,
  model: "GPT-4",
}

// ---- AI Analysis Results ----
export const aiAnalysis = {
  keyConcepts: [
    { label: "Civil Rights Movement", confidence: 0.97 },
    { label: "Nonviolent Protest", confidence: 0.92 },
    { label: "Martin Luther King Jr.", confidence: 0.95 },
    { label: "Civil Rights Act 1964", confidence: 0.94 },
    { label: "Legislative Change", confidence: 0.85 },
    { label: "Birmingham Campaign", confidence: 0.88 },
    { label: "Rosa Parks", confidence: 0.82 },
    { label: "Montgomery Bus Boycott", confidence: 0.80 },
  ],
  skillScores: [
    { skill: "Comprehension", score: 85, color: "emerald" },
    { skill: "Analysis", score: 62, color: "amber" },
    { skill: "Argumentation", score: 55, color: "red" },
    { skill: "Writing Mechanics", score: 78, color: "emerald" },
  ],
  summary:
    "The student demonstrates strong factual knowledge of the Civil Rights Movement, correctly identifying key figures, events, and legislation. However, the essay relies primarily on description rather than analysis. Connections between events and their broader significance are stated but not explored in depth. The thesis is present but underdeveloped — it asserts importance without establishing an analytical framework. Writing mechanics are generally sound with minor issues in paragraph transitions.",
}

/** Demo extraction result for the AI pipeline (Module 1: Evidence Extraction) */
export function getDemoExtractionResult() {
  return {
    keyClaims: [
      "Civil Rights Movement as transformative period in American history",
      "Martin Luther King Jr. as leader; nonviolence and civil disobedience",
      "Civil Rights Act of 1964 — landmark legislation; Kennedy proposed, Johnson signed",
      "Tactics: boycotts, sit-ins, marches; Montgomery Bus Boycott, Birmingham Campaign",
    ],
    concepts: aiAnalysis.keyConcepts.map((c) => c.label),
    argumentStructure: "Thesis (transformative period) → Key figures & events (King, Act of 1964) → Tactics (Montgomery, Birmingham) → Implied influence on legislation",
  }
}

// ---- Rubric Mapping ----
export type RubricStatus = "met" | "partial" | "missing"

export interface RubricRow {
  criterion: string
  level: string
  score: number
  maxScore: number
  status: RubricStatus
  evidenceFound: string
  gap: string
}

export const rubricMapping: RubricRow[] = [
  {
    criterion: "Thesis Development",
    level: "Proficient",
    score: 3,
    maxScore: 4,
    status: "met",
    evidenceFound:
      'Clear thesis statement in paragraph 1: "one of the most transformative periods in American history."',
    gap: "Thesis asserts importance but does not state an analytical argument about why/how.",
  },
  {
    criterion: "Evidence & Support",
    level: "Developing",
    score: 2,
    maxScore: 4,
    status: "partial",
    evidenceFound:
      "References to Montgomery Bus Boycott, Birmingham Campaign, Civil Rights Act, and multiple historical figures.",
    gap: "Evidence is listed but not analyzed. No primary sources or direct quotes used to support claims.",
  },
  {
    criterion: "Historical Analysis",
    level: "Beginning",
    score: 1,
    maxScore: 4,
    status: "missing",
    evidenceFound:
      'Brief mention that Birmingham "directly influenced" legislation.',
    gap: "No analysis of cause-and-effect, no examination of opposing forces, no discussion of why 1964 was the turning point.",
  },
  {
    criterion: "Cause & Effect Reasoning",
    level: "Developing",
    score: 2,
    maxScore: 4,
    status: "partial",
    evidenceFound:
      "Links Rosa Parks to Montgomery Boycott; links Birmingham to legislation.",
    gap: "Causal chains are implied but not explicitly developed. Does not explain mechanisms of change.",
  },
  {
    criterion: "Writing Mechanics",
    level: "Proficient",
    score: 3,
    maxScore: 4,
    status: "met",
    evidenceFound:
      "Well-structured paragraphs, correct grammar, appropriate academic vocabulary.",
    gap: "Paragraph transitions could be smoother. Some sentences are overly long.",
  },
]

// ---- Guiding Prompts ----
export interface GuidingPrompt {
  id: number
  targetGap: string
  difficulty: "Foundational" | "Analytical" | "Synthesis"
  prompt: string
}

export const guidingPrompts: GuidingPrompt[] = [
  {
    id: 1,
    targetGap: "Historical Analysis",
    difficulty: "Analytical",
    prompt:
      "Your essay describes the Civil Rights Act but doesn't analyze WHY it passed when it did. What political and social pressures made 1964 the turning point? Consider the role of media coverage, the assassination of JFK, and the strategic decisions of civil rights leaders in making federal legislation unavoidable.",
  },
  {
    id: 2,
    targetGap: "Evidence & Support",
    difficulty: "Analytical",
    prompt:
      "You mention Martin Luther King Jr.'s role but don't connect his strategy of nonviolent protest to specific legislative outcomes. How did the Birmingham Campaign directly influence Kennedy's decision to propose civil rights legislation? What specific images and events changed public opinion?",
  },
  {
    id: 3,
    targetGap: "Cause & Effect Reasoning",
    difficulty: "Synthesis",
    prompt:
      "Your conclusion restates your thesis but doesn't synthesize your argument. How do the events you described — from Montgomery to Birmingham to the signing of the Act — collectively demonstrate that the Civil Rights Movement was both a social AND political revolution? Build a causal chain that connects grassroots activism to federal policy change.",
  },
]

// ---- Pre-filled Student Response ----
export const studentResponse = `The Birmingham Campaign of 1963 was not merely a protest — it was a calculated strategic decision that fundamentally changed the political calculus of civil rights legislation. When Martin Luther King Jr. chose Birmingham, he selected the most segregated city in America, knowing that the brutal response of Police Commissioner Bull Connor would be broadcast on national television.

The images of fire hoses and police dogs turned against peaceful protesters, including children, shocked the nation's conscience. President Kennedy himself told advisors that the Birmingham images made him "sick," and within weeks he proposed the most comprehensive civil rights bill in American history. This demonstrates a clear causal chain: strategic nonviolent protest provoked a violent overreaction, which generated media coverage, which shifted public opinion, which created political pressure for legislative action.

The passage of the Civil Rights Act in 1964 was not inevitable — it required the convergence of grassroots activism, media attention, political leadership, and the emotional impact of JFK's assassination. The movement was simultaneously a social revolution in changing hearts and minds AND a political revolution in transforming federal law. Without understanding both dimensions, we cannot fully grasp why this period was truly transformative.`

// ---- Final Evaluation ----
export const evaluation = {
  overallScore: 78,
  maxScore: 100,
  grade: "B+",
  criterionScores: [
    { criterion: "Thesis Development", before: 3, after: 3.5, max: 4 },
    { criterion: "Evidence & Support", before: 2, after: 3, max: 4 },
    { criterion: "Historical Analysis", before: 1, after: 3, max: 4 },
    { criterion: "Cause & Effect", before: 2, after: 3.5, max: 4 },
    { criterion: "Writing Mechanics", before: 3, after: 3.2, max: 4 },
  ],
  feedback:
    "Strong improvement in connecting events to legislative outcomes. The revised analysis of the Birmingham Campaign shows significantly deeper understanding of cause-and-effect relationships. The causal chain from protest to media coverage to political pressure to legislation is clearly articulated and well-supported. Continue developing primary source integration and consider addressing counter-arguments to strengthen your thesis further.",
  improvement: "+16 points from initial submission",
}

// ---- Teacher Dashboard — All Students ----
export interface StudentRecord {
  id: string
  name: string
  avatar: string
  class: string
  assignment: string
  score: number
  maxScore: number
  status: "on-track" | "needs-support" | "critical"
  lastActivity: string
  flagged: boolean
  flagReason?: string
  flagSeverity?: "high" | "medium"
}

export const allStudents: StudentRecord[] = [
  {
    id: "s-001",
    name: "Sarah Johnson",
    avatar: "SJ",
    class: "US History — Period 3",
    assignment: "Civil Rights Movement Essay",
    score: 78,
    maxScore: 100,
    status: "on-track",
    lastActivity: "Just now",
    flagged: false,
  },
  {
    id: "s-002",
    name: "Marcus Chen",
    avatar: "MC",
    class: "US History — Period 3",
    assignment: "Civil Rights Movement Essay",
    score: 45,
    maxScore: 100,
    status: "critical",
    lastActivity: "2 hours ago",
    flagged: true,
    flagReason:
      "Scored below threshold on 4 of 5 rubric criteria. Essay shows significant factual errors about timeline of events.",
    flagSeverity: "high",
  },
  {
    id: "s-003",
    name: "Aisha Patel",
    avatar: "AP",
    class: "US History — Period 3",
    assignment: "Civil Rights Movement Essay",
    score: 91,
    maxScore: 100,
    status: "on-track",
    lastActivity: "1 hour ago",
    flagged: false,
  },
  {
    id: "s-004",
    name: "James Wilson",
    avatar: "JW",
    class: "US History — Period 1",
    assignment: "Civil Rights Movement Essay",
    score: 58,
    maxScore: 100,
    status: "needs-support",
    lastActivity: "3 hours ago",
    flagged: true,
    flagReason:
      "Strong factual knowledge but consistently fails to develop analytical arguments. Third consecutive assignment below expectations on Analysis criterion.",
    flagSeverity: "medium",
  },
  {
    id: "s-005",
    name: "Emily Rodriguez",
    avatar: "ER",
    class: "US History — Period 1",
    assignment: "Civil Rights Movement Essay",
    score: 82,
    maxScore: 100,
    status: "on-track",
    lastActivity: "30 min ago",
    flagged: false,
  },
  {
    id: "s-006",
    name: "David Kim",
    avatar: "DK",
    class: "US History — Period 1",
    assignment: "Civil Rights Movement Essay",
    score: 34,
    maxScore: 100,
    status: "critical",
    lastActivity: "5 hours ago",
    flagged: true,
    flagReason:
      "Essay is well below minimum length. Only 2 of 4 paragraphs completed. AI analysis suggests student may not have understood the assignment requirements.",
    flagSeverity: "high",
  },
  {
    id: "s-007",
    name: "Sofia Martinez",
    avatar: "SM",
    class: "US History — Period 3",
    assignment: "Civil Rights Movement Essay",
    score: 72,
    maxScore: 100,
    status: "needs-support",
    lastActivity: "4 hours ago",
    flagged: true,
    flagReason:
      "Writing mechanics are strong but historical analysis is consistently surface-level. May benefit from guided source analysis exercises.",
    flagSeverity: "medium",
  },
  {
    id: "s-008",
    name: "Tyler Brooks",
    avatar: "TB",
    class: "US History — Period 1",
    assignment: "Civil Rights Movement Essay",
    score: 88,
    maxScore: 100,
    status: "on-track",
    lastActivity: "2 hours ago",
    flagged: false,
  },
]

// ---- Class-level summaries ----
export const classSummaries = [
  {
    name: "US History — Period 1",
    students: 4,
    avgScore: 65.5,
    onTrack: 2,
    needsSupport: 1,
    critical: 1,
  },
  {
    name: "US History — Period 3",
    students: 4,
    avgScore: 71.5,
    onTrack: 2,
    needsSupport: 1,
    critical: 1,
  },
]
