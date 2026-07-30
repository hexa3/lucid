"use client";

import { ClassSummary } from "@/types";

interface TeacherHeatmapProps {
  summary: ClassSummary;
}

const TOPIC_LABELS: Record<string, string> = {
  force_mass_accel_relationship: "Force, Mass & Accel",
  inertia_momentum: "Inertia & Momentum",
  plant_nutrition_source: "Plant Nutrition",
  photosynthesis_respiration_relationship: "Photo vs Respiration",
  photosynthesis_mechanics: "Photosynthesis Mechanics",
  recursion_vs_iteration: "Recursion vs Loops",
  base_case_role: "Base Case Role",
  call_stack_propagation: "Call Stack",
  confirmation_bias: "Confirmation Bias",
  dunning_kruger_effect: "Dunning-Kruger",
  availability_heuristic: "Availability Heuristic",
};

function masteryToColor(score: number): string {
  if (score < 0.3) return "bg-[var(--color-danger)]";
  if (score < 0.45) return "bg-[var(--color-danger)]/80";
  if (score < 0.6) return "bg-[var(--color-warning)]";
  if (score < 0.75) return "bg-[var(--color-warning)]/70";
  if (score < 0.9) return "bg-[var(--color-success)]/70";
  return "bg-[var(--color-success)]";
}

export default function TeacherHeatmap({ summary }: TeacherHeatmapProps) {
  const { students, subconcept_mastery_matrix, top_class_misconception } = summary;
  const subconceptIds = Object.keys(subconcept_mastery_matrix);

  return (
    <div className="space-y-8">
      {/* Top Misconception Callout */}
      <div className="card p-6 md:p-7 border-l-[3px] border-l-[var(--color-danger)]" style={{ animation: "slideUp 0.4s forwards", opacity: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-danger-ghost)] flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">Most Common Class Misconception</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Lowest average mastery across all students</p>
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
          <p className="text-base md:text-lg leading-relaxed italic text-[var(--color-text-secondary)]">
            &ldquo;{top_class_misconception}&rdquo;
          </p>
        </div>
      </div>

      {/* Mastery Heatmap */}
      <div className="card p-6 md:p-7" style={{ animation: "slideUp 0.4s 0.08s forwards", opacity: 0 }}>
        <h3 className="font-bold text-lg mb-5">Class Mastery Heatmap</h3>

        {students.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            <p className="text-lg mb-2 font-medium">No student data yet</p>
            <p className="text-base">Students will appear here once they start learning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr>
                  <th className="text-left py-3 pr-5 text-[var(--color-text-muted)] font-semibold text-sm sticky left-0 bg-[var(--color-surface)] z-10">
                    Student
                  </th>
                  {subconceptIds.map((subId) => (
                    <th key={subId} className="py-3 px-2.5 text-center min-w-[110px]">
                      <div className="text-xs md:text-sm font-semibold text-[var(--color-text-muted)] truncate max-w-[110px]">
                        {TOPIC_LABELS[subId] ?? subId}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id} className="group border-t border-[var(--color-border)]">
                    <td className="py-3 pr-5 text-sm md:text-base font-medium sticky left-0 bg-[var(--color-surface)] group-hover:bg-[var(--color-surface-hover)] transition-colors">
                      {student.student_name}
                    </td>
                    {subconceptIds.map((subId) => {
                      const score = student.mastery[subId] ?? 0.5;
                      return (
                        <td key={subId} className="py-2 px-2.5">
                          <div
                            className={`h-9 md:h-10 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold font-mono transition-all duration-300 ${masteryToColor(score)} ${score < 0.45 ? "text-white" : "text-[var(--color-bg)]"}`}
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
        <div className="flex flex-wrap items-center gap-5 mt-6 pt-6 border-t border-[var(--color-border)]">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Mastery:</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[var(--color-danger)]" />
            <span className="text-sm text-[var(--color-text-muted)]">0–30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[var(--color-warning)]" />
            <span className="text-sm text-[var(--color-text-muted)]">30–75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[var(--color-success)]" />
            <span className="text-sm text-[var(--color-text-muted)]">75–100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
