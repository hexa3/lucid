import { NextRequest, NextResponse } from "next/server";
import { SEED_TOPICS } from "@/lib/seed-content";
import { getLLMProvider } from "@/lib/tier2-llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_id, misconception_id, subconcept_id, interest_tags, reading_level } = body;

    if (!topic_id || !misconception_id || !subconcept_id) {
      return NextResponse.json(
        { error: "Missing required fields: topic_id, misconception_id, subconcept_id", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const topic = SEED_TOPICS.find((t) => t.topic_id === topic_id);
    if (!topic) {
      return NextResponse.json(
        { error: `Unknown topic: ${topic_id}`, code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const sub = topic.subconcepts.find((s) => s.id === subconcept_id);
    if (!sub) {
      return NextResponse.json(
        { error: `Unknown subconcept: ${subconcept_id}`, code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const mc = sub.misconceptions.find((m) => m.id === misconception_id);
    const misconceptionStatement = mc?.statement ?? "Unknown misconception";

    const provider = getLLMProvider();
    const lesson = await provider.generateLesson({
      topic,
      subconceptId: subconcept_id,
      misconceptionStatement,
      interestTags: interest_tags ?? ["nature"],
      readingLevel: reading_level ?? "standard",
    });

    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error("Lesson generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson. Please try again.", code: "LESSON_ERROR" },
      { status: 500 }
    );
  }
}
