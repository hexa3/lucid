import { NextResponse } from "next/server";
import { SEED_TOPICS } from "@/lib/seed-content";

export async function GET() {
  try {
    const topics = SEED_TOPICS.map((t) => ({
      topic_id: t.topic_id,
      display_name: t.display_name,
      subconcept_count: t.subconcepts.length,
      subconcepts: t.subconcepts.map((s) => ({
        id: s.id,
        label: s.label,
        misconception_count: s.misconceptions.length,
      })),
    }));

    return NextResponse.json({ data: { topics } });
  } catch (error) {
    console.error("Topics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics.", code: "STORE_ERROR" },
      { status: 500 }
    );
  }
}
