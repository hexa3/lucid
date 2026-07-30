import { DiagnosisInput, DiagnosisOutput, MasteryState } from "@/types";
import { SEED_TOPICS } from "./seed-content";

import { embedText } from "./embeddings";
import { retrieveCandidates } from "./tier1-retrieval";
import { getLLMProvider } from "./tier2-llm";
import { applyMasteryDeltas, deriveEvidence, evidenceToQuality } from "./mastery-model";
import { createDefaultCard, updateSM2 } from "./mastery-model";
import { getMastery, setMastery, upsertCard, getCards } from "./store";
import { precomputeEmbeddings } from "./embeddings";

let initialized = false;

async function ensureInitialized() {
  if (initialized) return;
  console.log("[Lucid] Precomputing embeddings for seed topics...");
  try {
    await precomputeEmbeddings(SEED_TOPICS);
    initialized = true;
    console.log("[Lucid] Embeddings ready.");
  } catch (err) {
    console.error("[Lucid] Failed to precompute embeddings:", err);
    // Still mark as initialized to avoid retrying on every request
    initialized = true;
  }
}

/**
 * Orchestrate the full diagnosis pipeline:
 * 1. Embed the student's explanation
 * 2. Retrieve candidate misconceptions (Tier 1)
 * 3. Verify + generate with LLM (Tier 2)
 * 4. Update mastery model
 * 5. Update SM-2 cards
 */
export async function runDiagnosisPipeline(
  input: DiagnosisInput
): Promise<DiagnosisOutput> {
  await ensureInitialized();
  const topic = SEED_TOPICS.find((t) => t.topic_id === input.topic_id);
  if (!topic) {
    throw new Error(`Unknown topic: ${input.topic_id}`);
  }

  // Step 1: Embed student explanation
  const studentEmbedding = await embedText(input.student_explanation_text);

  // Step 2: Tier 1 — Retrieve candidate misconceptions
  const candidates = retrieveCandidates(studentEmbedding, topic);

  // Step 3: Tier 2 — LLM verification
  const provider = getLLMProvider();
  const verification = await provider.verifyMisconceptions({
    studentExplanation: input.student_explanation_text,
    candidates,
    topic,
  });

  // Step 4: Update mastery model
  const currentMastery = getMastery(input.user_id);
  const updatedMastery = applyMasteryDeltas(
    currentMastery,
    verification.mastery_deltas
  );
  setMastery(input.user_id, updatedMastery);

  // Step 5: Update SM-2 cards
  const evidence = deriveEvidence(
    verification.detected_misconceptions,
    verification.mastery_deltas
  );
  const quality = evidenceToQuality(evidence);

  // Update cards for each affected subconcept
  const allSubconceptIds = new Set([
    ...verification.detected_misconceptions.map((m) => m.subconcept_id),
    ...Object.keys(verification.mastery_deltas),
  ]);
  const existingCards = getCards(input.user_id);
  for (const subId of allSubconceptIds) {
    const cardId = `${input.topic_id}:${subId}`;
    let card =
      existingCards.find((c) => c.id === cardId) ??
      createDefaultCard(input.user_id, input.topic_id, subId);
    card = updateSM2(card, quality);
    upsertCard(input.user_id, card);
  }

  return {
    detected_misconceptions: verification.detected_misconceptions,
    updated_mastery: updatedMastery,
    socratic_followup: verification.socratic_followup,
  };
}


