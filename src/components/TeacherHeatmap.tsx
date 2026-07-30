"use client";

import { ClassSummary } from "@/types";

interface TeacherHeatmapProps {
  summary: ClassSummary;
}

// Topic labels for the heatmap - imported inline to avoid type issues in client components
const TOPIC_LABELS: Record<string, string> = {
  force_mass_accel_relationship: "Force, mass, acceleration",
  inertia_momentum: "Inertia & momentum",
  plant_nutrition_source: "Plant nutrition source",
  photosynthesis_respiration_relationship: "Photosynthesis vs respiration",
  photosynthesis_mechanics: "Photosynthesis mechanics",
  recursion_vs_iteration: "Recursion vs loops",
  base_case_role: "Base case role",
  call_stack_propagation: "Call stack propagation",
  confirmation_bias: "Confirmation bias",
  dunning_kruger_effect: "Dunning-Kruger effect",
  availability_heuristic: "Availability heuristic",
};

function masteryToColor(score: number): string {
  if (score < 0.3) return "bg-[var(--color-danger)]";
  if (score < 0.45) return "bg-[var(--color-danger)]/70";
  if (score < 0.6) return "bg-[var(--color-warning)]/80";
  if (score < 0.75) return "bg-[var(--color-warning)]/50";
  if (score < 0.9) return "bg-[var(--color-success)]/60";
  return "bg-[var(--color-success)]";
}

function masteryToTextColor(score: number): string {
  if (score < 0.45) return "text-white";
  return "text-[var(--color-text)]";
}

export default function TeacherHeatmap({ summary }: TeacherHeatmapProps) {
  const { students, subconcept_mastery_matrix, top_class_misconception } =
    summary;

  const subconceptIds = Object.keys(subconcept_mastery_matrix);

  return (
    <div className="space-y-8">
      {/* ─── Top Misconception Callout ─────────────── */}
      <div className="glass rounded-xl p-6 border-l-4 border-l-[var(--color-danger)] animate-slideUp">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <h3 className="font-semibold">
            Most Common Class Misconception
          </h3>
        </div>
        <p className="text-lg leading-relaxed italic">
          &ldquo;{top_class_misconception}&rdquo;
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          Based on lowest average mastery scores across all students
        </p>
      </div>

      {/* ─── Mastery Heatmap ────────────────────────── */}
      <div className="glass rounded-xl p-6 animate-slideUp" style={{ animationDelay: "0.1s" }}>
        <h3 className="font-semibold mb-4">Class Mastery Heatmap</h3>

        {students.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <p className="text-lg mb-2">No student data yet</p>
            <p className="text-sm">
              Students will appear here once they start learning.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-[var(--color-text-muted)] font-medium">
                    Student
                  </th>
                  {subconceptIds.map((subId) => (
                    <th
                      key={subId}
                      className="py-2 px-2 text-[var(--color-text-muted)] font-medium text-xs text-center min-w-[100px]"
                    >
                      <div className="truncate max-w-[100px]">
                        {TOPIC_LABELS[subId] ?? subId}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id} className="group">
                    <td className="py-2 pr-4 text-sm font-medium">
                      {student.student_name}
                    </td>
                    {subconceptIds.map((subId) => {
                      const score = student.mastery[subId] ?? 0.5;
                      return (
                        <td key={subId} className="py-1.5 px-2">
                          <div
                            className={`w-full h-8 rounded-md flex items-center justify-center text-xs font-mono font-semibold transition-all duration-300 ${masteryToColor(score)} ${masteryToTextColor(score)}`}
                            title={`${TOPIC_LABELS[subId] ?? subId}: ${Math.round(score * 100)}%`}
                          >
                            {Math.round(score * 100)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)]">Mastery:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[var(--color-danger)]" />
            <span className="text-xs text-[var(--color-text-muted)]">0–30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[var(--color-warning)]/70" />
            <span className="text-xs text-[var(--color-text-muted)]">30–60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[var(--color-success)]" />
            <span className="text-xs text-[var(--color-text-muted)]">90–100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
