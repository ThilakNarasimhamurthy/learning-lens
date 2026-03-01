// =============================================================
// Demo data — Composting Systems project only
// =============================================================

// ---- Student being demonstrated ----
export const demoStudent = {
  id: "s1",
  name: "Alex Chen",
  avatar: "AC",
  class: "Period 1 Science",
  assignment: "Composting Systems",
  submittedAt: "Feb 23 2026, 10:42 AM",
}

// ---- Uploaded evidence (composting content) ----
export const essayText = `Aerobic bacteria need oxygen (O2) to break down organic matter into humus. Anaerobic bacteria in landfills produce methane (CH4) when air is lacking. Flow of Matter: food waste → cellular respiration/CO2 → humus.

The Carbon-to-Nitrogen (C:N) ratio of 30:1 is optimal for composting. Greens (nitrogen): food scraps. Browns (carbon): leaves, paper. Comparative table: three-bin vs vermicomposting for capacity, speed, labor.

Composting 101: Aerobic decomposition uses O2; anaerobic in landfills produces CH4. Flow diagram: inputs → process → humus.`

// ---- AI "run" stats (mimics real API usage) ----
export const demoAIStats = {
  processingTimeMs: 1847,
  tokensUsed: 2843,
  model: "GPT-4",
}

// ---- AI Analysis Results (Composting Systems) ----
export const aiAnalysis = {
  keyConcepts: [
    { label: "Aerobic bacteria", confidence: 0.97 },
    { label: "Anaerobic decomposition", confidence: 0.92 },
    { label: "Carbon-to-Nitrogen ratio", confidence: 0.95 },
    { label: "Methane (CH4)", confidence: 0.94 },
    { label: "Humus", confidence: 0.85 },
    { label: "Three-bin system", confidence: 0.88 },
    { label: "Vermicomposting", confidence: 0.82 },
    { label: "Flow of Matter", confidence: 0.80 },
  ],
  skillScores: [
    { skill: "Scientific understanding", score: 85, color: "emerald" },
    { skill: "System design", score: 72, color: "emerald" },
    { skill: "Evidence & support", score: 65, color: "amber" },
    { skill: "Communication", score: 78, color: "emerald" },
  ],
  summary:
    "The student demonstrates solid understanding of aerobic vs. anaerobic composting and the carbon cycle. C:N ratio and flow of matter are clearly explained. Consider adding more detail on moisture control, aeration, and system dimensions to strengthen the design criteria.",
}

/** Demo extraction result for the AI pipeline (Composting Systems) */
export function getDemoExtractionResult() {
  return {
    keyClaims: [
      "Aerobic bacteria need oxygen to break down organic matter into humus",
      "Anaerobic bacteria in landfills produce methane (CH4)",
      "Flow of Matter: food waste → cellular respiration/CO2 → humus",
      "C:N ratio 30:1; greens (nitrogen) and browns (carbon)",
      "Three-bin vs vermicomposting comparison",
    ],
    concepts: aiAnalysis.keyConcepts.map((c) => c.label),
    argumentStructure:
      "Aerobic vs anaerobic → C:N ratio & inputs → Flow of matter → System comparison (three-bin vs vermicomposting)",
  }
}

// ---- Rubric Mapping (Composting Systems — aligns with per-week rubrics) ----
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
    criterion: "Climate Resilience",
    level: "Meets Standards",
    score: 3,
    maxScore: 4,
    status: "met",
    evidenceFound: "Identifies that cold is a problem and suggests basic insulation.",
    gap: "Propose a more detailed winter plan with scientific reasoning (e.g., pile mass to retain metabolic heat).",
  },
  {
    criterion: "Troubleshooting Logic",
    level: "Meets Standards",
    score: 3,
    maxScore: 4,
    status: "met",
    evidenceFound: "Identifies anaerobic pile signs (odor) and suggests adding Browns or turning.",
    gap: "Distinguish between different pile failures (Too Wet vs. Too Dry vs. Anaerobic) with distinct fixes.",
  },
  {
    criterion: "Engineering Refinement",
    level: "Developing",
    score: 2,
    maxScore: 4,
    status: "partial",
    evidenceFound: "Describes the original plan.",
    gap: "Modify the Week 2 design based on research (e.g., add lid and drainage layer after researching rain impact).",
  },
]

// Weak evidence (e.g., just Article: URL with no substantive content) — scores 1, 1, 2
export const weakEvidenceRubricMapping: RubricRow[] = [
  {
    criterion: "Climate Resilience",
    level: "Below Standards",
    score: 1,
    maxScore: 4,
    status: "not_met",
    evidenceFound: "Ignores the impact of climate/temperature on the system.",
    gap: "Propose a detailed winter plan with scientific reasoning (e.g., pile mass to retain metabolic heat).",
  },
  {
    criterion: "Troubleshooting Logic",
    level: "Below Standards",
    score: 1,
    maxScore: 4,
    status: "not_met",
    evidenceFound: "Cannot identify how to fix a failing compost pile.",
    gap: "Distinguish between different pile failures (Too Wet vs. Too Dry vs. Anaerobic) with distinct fixes.",
  },
  {
    criterion: "Engineering Refinement",
    level: "Approaching Standards",
    score: 2,
    maxScore: 4,
    status: "partial",
    evidenceFound: "Describes the original plan again without adding new safeguards or refinements.",
    gap: "Modify the Week 2 design based on research (e.g., add lid and drainage layer after researching rain impact).",
  },
]

// ---- Guiding Prompts (Composting Systems — Climate, Troubleshooting, Engineering) ----
export interface GuidingPrompt {
  id: number
  targetGap: string
  difficulty: "Foundational" | "Analytical" | "Synthesis"
  prompt: string
}

export const guidingPrompts: GuidingPrompt[] = [
  {
    id: 1,
    targetGap: "Climate Resilience",
    difficulty: "Analytical",
    prompt:
      "Propose a detailed winter plan for your composting system. Use scientific reasoning: e.g., increasing pile mass to retain metabolic heat. Consider insulation, tarp use, and location. Why does temperature matter for the microbes?",
  },
  {
    id: 2,
    targetGap: "Troubleshooting Logic",
    difficulty: "Foundational",
    prompt:
      "Clearly distinguish between different types of pile failure: Too Wet vs. Too Dry vs. Anaerobic. For each, what are the signs and what is the distinct fix? Explain the chemical fix for anaerobic conditions (odor) — why adding Browns or turning helps.",
  },
  {
    id: 3,
    targetGap: "Engineering Refinement",
    difficulty: "Synthesis",
    prompt:
      "Modify your original Week 2 design based on new research or experience. What did you learn? For example: 'We added a lid and a drainage layer after researching rain impact.' Describe the refinements and justify them.",
  },
]

// ---- Pre-filled Student Response (Composting) ----
export const studentResponse = `The optimal C:N ratio for composting is 30:1. Carbon-rich "browns" (leaves, paper, cardboard) provide energy for microbes, while nitrogen-rich "greens" (food scraps, grass clippings) supply protein for cell growth. Too much carbon slows decomposition; too much nitrogen can cause odors and ammonia loss.

My three-bin system would be 3ft × 3ft × 3ft per bin, placed in a sunny spot near the garden with good drainage. I would water when the pile feels dry (squeeze test — a few drops of moisture is ideal) and turn weekly with a pitchfork. The layered design and regular turning ensure oxygen reaches aerobic bacteria throughout the pile.`

// ---- Final Evaluation (Composting Systems) ----
export const evaluation = {
  overallScore: 82,
  maxScore: 100,
  grade: "B+",
  criterionScores: [
    { criterion: "Climate Resilience", before: 3, after: 4, max: 4 },
    { criterion: "Troubleshooting Logic", before: 3, after: 4, max: 4 },
    { criterion: "Engineering Refinement", before: 2, after: 3.5, max: 4 },
  ],
  feedback:
    "Strong improvement in climate resilience (winter plan with scientific reasoning) and troubleshooting logic (distinct fixes for Too Wet, Too Dry, Anaerobic). Engineering refinements show research-based modifications. Continue documenting design changes.",
  improvement: "+18 points from initial submission",
}

// ---- Teacher Dashboard — All Students (Composting Systems) ----
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
    id: "s1",
    name: "Alex Chen",
    avatar: "AC",
    class: "Period 1 Science",
    assignment: "Composting Systems",
    score: 85,
    maxScore: 100,
    status: "on-track",
    lastActivity: "Just now",
    flagged: false,
  },
  {
    id: "s2",
    name: "Jordan Smith",
    avatar: "JS",
    class: "Period 1 Science",
    assignment: "Composting Systems",
    score: 42,
    maxScore: 100,
    status: "critical",
    lastActivity: "2 hours ago",
    flagged: true,
    flagReason:
      "Average score of 1.5/4 is below threshold. Consider scheduling one-on-one to review rubric and provide support.",
    flagSeverity: "high",
  },
  {
    id: "s3",
    name: "Sam Rivera",
    avatar: "SR",
    class: "Period 1 Science",
    assignment: "Composting Systems",
    score: 78,
    maxScore: 100,
    status: "on-track",
    lastActivity: "1 hour ago",
    flagged: false,
  },
  {
    id: "s4",
    name: "Taylor Kim",
    avatar: "TK",
    class: "Period 1 Science",
    assignment: "Composting Systems",
    score: 55,
    maxScore: 100,
    status: "needs-support",
    lastActivity: "3 hours ago",
    flagged: true,
    flagReason:
      "No submissions in 6 days. Check in with student about barriers to progress.",
    flagSeverity: "medium",
  },
]

// ---- Class-level summaries (Composting Systems) ----
export const classSummaries = [
  {
    name: "Period 1 Science",
    students: 4,
    avgScore: 65,
    onTrack: 2,
    needsSupport: 1,
    critical: 1,
  },
]
