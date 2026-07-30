import { NextRequest, NextResponse } from "next/server";
import { runDiagnosisPipeline } from "@/lib/pipeline";
import { DiagnosisInput } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosisInput = await request.json();

    // Validate required fields
    if (!body.topic_id || !body.student_explanation_text || !body.user_id) {
      return NextResponse.json(
        { error: "Missing required fields: topic_id, student_explanation_text, user_id", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (body.student_explanation_text.trim().length < 10) {
      return NextResponse.json(
        { error: "Explanation must be at least 10 characters long", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const result = await runDiagnosisPipeline(body);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Diagnosis pipeline error:", error);
    return NextResponse.json(
      {
        error: "Failed to process your explanation. Please try again.",
        code: "PIPELINE_ERROR",
      },
      { status: 500 }
    );
  }
}
