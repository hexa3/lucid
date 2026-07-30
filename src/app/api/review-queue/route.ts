import { NextRequest, NextResponse } from "next/server";
import { getDueCards } from "@/lib/store";
import { SEED_TOPICS } from "@/lib/seed-content";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query param: user_id", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const dueCards = getDueCards(userId);
    const dueItems = dueCards.map((card) => {
      const topic = SEED_TOPICS.find((t) => t.topic_id === card.topic_id);
      const subconcept = topic?.subconcepts.find((s) => s.id === card.subconcept_id);
      return {
        subconcept_id: card.subconcept_id,
        topic_id: card.topic_id,
        display_name: subconcept?.label ?? card.subconcept_id,
        topic_name: topic?.display_name ?? card.topic_id,
        due_date: card.dueDate,
      };
    });

    return NextResponse.json({ data: { due_items: dueItems } });
  } catch (error) {
    console.error("Review queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review queue.", code: "STORE_ERROR" },
      { status: 500 }
    );
  }
}
