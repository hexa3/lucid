import { DetectedMisconception, LessonOutput, Topic } from "@/types";
import { CandidateResult } from "./tier1-retrieval";

// ─── LLM Provider Interface ───────────────────────────────
// Pluggable: supports OpenAI, Anthropic Claude, and Google Gemini.
// Set LLM_PROVIDER env var to configure.

export interface LLMProvider {
  name: string;
  verifyMisconceptions(params: {
    studentExplanation: string;
    candidates: CandidateResult[];
    topic: Topic;
  }): Promise<VerificationResult>;

  generateLesson(params: {
    topic: Topic;
    subconceptId: string;
    misconceptionStatement: string;
    interestTags: string[];
    readingLevel?: "simple" | "standard" | "advanced";
  }): Promise<LessonOutput>;
}

export interface VerificationResult {
  detected_misconceptions: DetectedMisconception[];
  mastery_deltas: Record<string, number>;
  socratic_followup: string;
}

// ─── Mock LLM Provider (for development / hackathon demo) ─

/**
 * A mock LLM provider that returns sensible canned responses.
 * Used when no real API key is configured.
 * In production, swap with OpenAI, Anthropic, or Gemini provider.
 */
class MockLLMProvider implements LLMProvider {
  name = "mock";

  async verifyMisconceptions(_params: {
    studentExplanation: string;
    candidates: CandidateResult[];
    topic: Topic;
  }): Promise<VerificationResult> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    const { candidates } = _params;

    if (candidates.length === 0) {
      return {
        detected_misconceptions: [],
        mastery_deltas: {
          [_params.topic.subconcepts[0]?.id ?? "unknown"]: 0.2,
        },
        socratic_followup:
          "Great explanation! Let's dig a bit deeper — can you think of a real-world example that would challenge your understanding?",
      };
    }

    const detected: DetectedMisconception[] = candidates.map((c) => ({
      id: c.misconception.id,
      subconcept_id: c.subconceptId,
      confidence: Math.round(c.score * 100) / 100,
      evidence_quote: _params.studentExplanation
        .split(" ")
        .slice(0, 5)
        .join(" ") + "...",
    }));

    const masteryDeltas: Record<string, number> = {};
    const uniqueSubconcepts = [...new Set(candidates.map((c) => c.subconceptId))];
    for (const subId of uniqueSubconcepts) {
      masteryDeltas[subId] = -0.15 - Math.random() * 0.1;
    }

    return {
      detected_misconceptions: detected,
      mastery_deltas: masteryDeltas,
      socratic_followup: candidates[0]?.misconception.socratic_probe ??
        "What makes you think that's the case?",
    };
  }

  async generateLesson(params: {
    topic: Topic;
    subconceptId: string;
    misconceptionStatement: string;
    interestTags: string[];
    readingLevel?: "simple" | "standard" | "advanced";
  }): Promise<LessonOutput> {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));

    const tag = params.interestTags[0] || "nature";
    const sub = params.topic.subconcepts.find(
      (s) => s.id === params.subconceptId
    );
    const subLabel = sub?.label ?? "this concept";

    const analogies: Record<string, string> = {
      sports: `Think of ${subLabel} like a sports team. ${params.misconceptionStatement} — but actually, it's more like how different players have different roles that work together.`,
      gaming: `Imagine ${subLabel} as a video game mechanic. ${params.misconceptionStatement} — but actually, it works more like how game stats interact.`,
      cooking: `${subLabel} is like cooking. ${params.misconceptionStatement} — but it's really more like how heat transforms ingredients differently.`,
      nature: `Think of ${subLabel} like an ecosystem. ${params.misconceptionStatement} — but actually, nature works in cycles where everything is connected.`,
      music: `${subLabel} is like a musical chord. ${params.misconceptionStatement} — but it's actually more like how different notes harmonize.`,
      art: `Think of ${subLabel} like mixing colors on a palette. ${params.misconceptionStatement} — but the real process is more like how primary colors blend.`,
      cars: `${subLabel} is like a car's engine. ${params.misconceptionStatement} — but it actually works more like how torque and horsepower relate.`,
      movies: `Imagine ${subLabel} as a movie plot. ${params.misconceptionStatement} — but it's really more like how subplots connect to the main story.`,
      dance: `${subLabel} is like learning a dance routine. ${params.misconceptionStatement} — but it's actually more like how individual moves build into a full choreography.`,
      technology: `Think of ${subLabel} like a software stack. ${params.misconceptionStatement} — but it's really more like how layers of abstraction work.`,
    };

    const analogy = analogies[tag] || analogies.nature;

    return {
      analogy_text: analogy,
      socratic_question: sub?.misconceptions[0]?.socratic_probe ??
        "What evidence do you have for your current understanding?",
      full_explanation: `Let's clarify ${subLabel}.\n\n${params.misconceptionStatement}\n\nActually, here's how it works: each sub-concept builds on the previous one. Understanding the relationship between them is key to mastering this topic.\n\n${analogy}\n\nThink about this: what would happen if you applied your current understanding to a new situation? Would it still hold?`,
    };
  }
}

// ─── Factory ───────────────────────────────────────────────

let provider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!provider) {
    const configuredProvider = process.env.LLM_PROVIDER || "mock";

    switch (configuredProvider) {
      // In a real implementation, add cases for "openai", "anthropic", "gemini"
      // that instantiate the appropriate provider classes.
      default:
        console.warn(
          `LLM provider "${configuredProvider}" not configured. Using mock provider.`
        );
        provider = new MockLLMProvider();
    }
  }
  return provider;
}
