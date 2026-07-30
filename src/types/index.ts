// ─── Seed Content Types ───────────────────────────────────

export interface Misconception {
  id: string;
  statement: string;
  socratic_probe: string;
  /** Precomputed embedding vector (populated at init time) */
  embedding?: number[];
}

export interface SubConcept {
  id: string;
  label: string;
  misconceptions: Misconception[];
}

export interface Topic {
  topic_id: string;
  display_name: string;
  subconcepts: SubConcept[];
}

// ─── Pipeline Types ──────────────────────────────────────

export interface DiagnosisInput {
  topic_id: string;
  student_explanation_text: string;
  user_id: string;
}

export interface DetectedMisconception {
  id: string;
  /** Sub-concept ID this misconception belongs to */
  subconcept_id: string;
  confidence: number;
  evidence_quote: string;
}

export interface Tier1Result {
  candidates: Array<{
    misconception: Misconception;
    subconcept_id: string;
    score: number;
  }>;
}

export interface Tier2Result {
  detected_misconceptions: DetectedMisconception[];
  mastery_deltas: Record<string, number>;
  socratic_followup: string;
  personalized_analogy: string;
}

export interface DiagnosisOutput {
  detected_misconceptions: DetectedMisconception[];
  updated_mastery: Record<string, number>;
  socratic_followup: string;
}

export interface LessonInput {
  topic_id: string;
  misconception_id: string;
  subconcept_id: string;
  interest_tags: string[];
  reading_level?: "simple" | "standard" | "advanced";
}

export interface LessonOutput {
  analogy_text: string;
  socratic_question: string;
  full_explanation: string;
}

// ─── Mastery & Spaced Repetition Types ──────────────────

export interface MasteryState {
  /** Sub-concept ID → mastery score (0–1) */
  [subconceptId: string]: number;
}

export interface SMCard {
  /** Composite key: `${topic_id}:${subconcept_id}` */
  id: string;
  user_id: string;
  topic_id: string;
  subconcept_id: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  dueDate: string; // ISO date string
}

export interface ReviewQueueItem {
  subconcept_id: string;
  topic_id: string;
  due_date: string;
}

export interface ReviewInput {
  user_id: string;
  subconcept_id: string;
  /** 0–5 quality score derived from session evidence */
  quality: number;
}

export interface ReviewOutput {
  updated_card: SMCard;
}

// ─── Teacher Dashboard Types ────────────────────────────

export interface StudentMastery {
  student_id: string;
  student_name: string;
  mastery: Record<string, number>;
}

export interface ClassSummary {
  students: StudentMastery[];
  subconcept_mastery_matrix: Record<string, number[]>; // subconcept_id → array of scores
  top_class_misconception: string;
  misconception_count: number;
}

// ─── User Types ─────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  interest_tags: string[];
  reading_level: "simple" | "standard" | "advanced";
  accessibility: {
    highContrast: boolean;
    dyslexiaFont: boolean;
    textToSpeech: boolean;
  };
}

// ─── Interest Tags ──────────────────────────────────────

export const INTEREST_TAGS = [
  "sports",
  "music",
  "gaming",
  "cooking",
  "nature",
  "art",
  "cars",
  "movies",
  "dance",
  "technology",
] as const;

export type InterestTag = (typeof INTEREST_TAGS)[number];

// ─── API Response Wrappers ──────────────────────────────

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}
