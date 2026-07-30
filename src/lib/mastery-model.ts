import { DetectedMisconception, MasteryState, SMCard } from "@/types";

// ─── Mastery Model ─────────────────────────────────────────
// Updated with exponential moving average: mastery = clamp(mastery + LR * (evidence - mastery), 0, 1)

const LEARNING_RATE = 0.3;
const MIN_MASTERY = 0;
const MAX_MASTERY = 1;

/**
 * Update a mastery score using an exponential moving average.
 * @param current - Current mastery score (0-1)
 * @param evidence - New evidence score (0-1) derived from how well the student understood
 * @returns Updated mastery score clamped to [0, 1]
 */
export function updateMastery(current: number, evidence: number): number {
  const updated = current + LEARNING_RATE * (evidence - current);
  return Math.max(MIN_MASTERY, Math.min(MAX_MASTERY, updated));
}

/**
 * Apply multiple mastery deltas from a tier-2 diagnosis result.
 * Returns a new MasteryState (immutable update).
 */
export function applyMasteryDeltas(
  currentMastery: MasteryState,
  deltas: Record<string, number>
): MasteryState {
  const next = { ...currentMastery };
  for (const [subconceptId, delta] of Object.entries(deltas)) {
    const current = next[subconceptId] ?? 0.5; // default to 0.5 (neutral)
    next[subconceptId] = updateMastery(current, current + delta);
  }
  return next;
}

/**
 * Derive a 0-5 quality score from mastery evidence.
 * Maps the evidence value (0-1) to SM-2's quality scale.
 */
export function evidenceToQuality(evidence: number): number {
  if (evidence >= 0.95) return 5; // Perfect recall
  if (evidence >= 0.85) return 4; // Correct after hesitation
  if (evidence >= 0.7) return 3;  // Correct with difficulty
  if (evidence >= 0.5) return 2;  // Incorrect but close
  if (evidence >= 0.3) return 1;  // Wrong, but familiar
  return 0;                        // Complete blackout
}

/**
 * Derive an evidence score from a confidence rating and mastery delta direction.
 * Positive delta = good understanding, negative = struggling.
 */
export function deriveEvidence(
  detected: DetectedMisconception[],
  masteryDeltas: Record<string, number>
): number {
  // If no misconceptions detected, strong evidence of understanding
  if (detected.length === 0) return 0.9;

  // The average confidence of detected misconceptions inversely correlates with evidence
  const avgConfidence =
    detected.reduce((sum, d) => sum + d.confidence, 0) / detected.length;

  // Average mastery delta across affected subconcepts
  const deltas = Object.values(masteryDeltas);
  const avgDelta =
    deltas.length > 0
      ? deltas.reduce((a, b) => a + b, 0) / deltas.length
      : 0;

  // High confidence in misconceptions + negative delta = low evidence
  const evidence = 0.5 + avgDelta - avgConfidence * 0.5;
  return Math.max(0, Math.min(1, evidence));
}

// ─── SM-2 Spaced Repetition Algorithm ──────────────────────
// Reference: https://gwern.net/doc/spaced-repetition/algorithm/sm-2-algorithm.pdf

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

export function createDefaultCard(
  userId: string,
  topicId: string,
  subconceptId: string
): SMCard {
  return {
    id: `${topicId}:${subconceptId}`,
    user_id: userId,
    topic_id: topicId,
    subconcept_id: subconceptId,
    repetitions: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    dueDate: new Date().toISOString(), // Due immediately
  };
}

/**
 * SM-2 spaced repetition algorithm.
 *
 * @param card - The current SMCard state
 * @param quality - 0-5 quality score
 * @returns Updated SMCard
 */
export function updateSM2(card: SMCard, quality: number): SMCard {
  const updated = { ...card };

  if (quality < 3) {
    // Failed recall — reset
    updated.repetitions = 0;
    updated.interval = 1;
  } else {
    // Successful recall — lengthen interval
    updated.repetitions += 1;
    if (updated.repetitions === 1) {
      updated.interval = 1;
    } else if (updated.repetitions === 2) {
      updated.interval = 6;
    } else {
      updated.interval = Math.round(updated.interval * updated.easeFactor);
    }

    // Update ease factor
    updated.easeFactor = Math.max(
      MIN_EASE_FACTOR,
      updated.easeFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  }

  // Set due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + updated.interval);
  updated.dueDate = dueDate.toISOString();

  return updated;
}
