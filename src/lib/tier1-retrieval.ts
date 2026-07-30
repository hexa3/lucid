import { Topic, Misconception } from "@/types";

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

const THRESHOLD = 0.45;
const MAX_CANDIDATES = 3;

export interface CandidateResult {
  misconception: Misconception;
  subconceptId: string;
  score: number;
}

/**
 * Tier 1: Retrieve the top-N misconception candidates by cosine similarity.
 *
 * Embeds the student's explanation (embedding passed in externally to
 * avoid re-embedding in the pipeline) and compares against all
 * precomputed misconception embeddings for the given topic.
 */
export function retrieveCandidates(
  studentEmbedding: number[],
  topic: Topic
): CandidateResult[] {
  const candidates: CandidateResult[] = [];

  for (const subconcept of topic.subconcepts) {
    for (const misconception of subconcept.misconceptions) {
      if (!misconception.embedding) continue;
      const score = cosineSimilarity(studentEmbedding, misconception.embedding);
      candidates.push({
        misconception,
        subconceptId: subconcept.id,
        score,
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.score > THRESHOLD)
    .slice(0, MAX_CANDIDATES);
}
