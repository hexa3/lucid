import { NextRequest, NextResponse } from "next/server";
import { getCards, upsertCard } from "@/lib/store";
import { updateSM2, createDefaultCard } from "@/lib/mastery-model";
import { ReviewInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ReviewInput = await request.json();
    const { user_id, subconcept_id, quality } = body;

    if (!user_id || !subconcept_id || quality === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, subconcept_id, quality", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
      return NextResponse.json(
        { error: "Quality must be an integer between 0 and 5", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Find the card (first matching one across all topics)
    // In a full implementation, you'd pass topic_id too
    const existingCards = getCards(user_id);
    let card = existingCards.find((c) => c.subconcept_id === subconcept_id);

    if (!card) {
      // Create a default card if not found
      card = createDefaultCard(user_id, "unknown", subconcept_id);
    }

    const updatedCard = updateSM2(card, quality);
    upsertCard(user_id, updatedCard);

    return NextResponse.json({ data: { updated_card: updatedCard } });
  } catch (error) {
    console.error("Review result error:", error);
    return NextResponse.json(
      { error: "Failed to record review result.", code: "STORE_ERROR" },
      { status: 500 }
    );
  }
}
