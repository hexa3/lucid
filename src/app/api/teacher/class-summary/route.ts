import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getMastery } from "@/lib/store";
import { SEED_TOPICS } from "@/lib/seed-content";
import { ClassSummary, StudentMastery, MasteryState } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const users = getAllUsers();
    const students: StudentMastery[] = [];
    const allSubconceptIds = new Set<string>();

    for (const topic of SEED_TOPICS) {
      for (const sub of topic.subconcepts) {
        allSubconceptIds.add(sub.id);
      }
    }

    // Build subconcept_mastery_matrix: subconcept_id → array of scores
    const matrix: Record<string, number[]> = {};
    for (const subId of allSubconceptIds) {
      matrix[subId] = [];
    }

    // Track misconception counts for "top class misconception"
    const misconceptionAttempts: Record<string, { topicId: string; misconceptionId: string; statement: string; count: number }> = {};

    for (const user of users) {
      const mastery: MasteryState = getMastery(user.id);
      const studentEntry: StudentMastery = {
        student_id: user.id,
        student_name: user.name,
        mastery: {},
      };
      for (const subId of allSubconceptIds) {
        const score = mastery[subId] ?? 0.5;
        studentEntry.mastery[subId] = score;
        matrix[subId].push(score);
      }
      students.push(studentEntry);
    }

    // Find top class misconception (mock: pick the lowest-mastery subconcept)
    let lowestMasterySubId = "";
    let lowestAvg = Infinity;
    for (const [subId, scores] of Object.entries(matrix)) {
      if (scores.length === 0) continue;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        lowestMasterySubId = subId;
      }
    }

    // Find the misconception statement for the weakest subconcept
    let topMisconception = "No data available";
    let misconceptionCount = 0;
    for (const topic of SEED_TOPICS) {
      const sub = topic.subconcepts.find((s) => s.id === lowestMasterySubId);
      if (sub && sub.misconceptions.length > 0) {
        topMisconception = sub.misconceptions[0].statement;
        misconceptionCount = sub.misconceptions.length;
        break;
      }
    }

    const summary: ClassSummary = {
      students,
      subconcept_mastery_matrix: matrix,
      top_class_misconception: topMisconception,
      misconception_count: misconceptionCount,
    };

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("Class summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate class summary.", code: "STORE_ERROR" },
      { status: 500 }
    );
  }
}
