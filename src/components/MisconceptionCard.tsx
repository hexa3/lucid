"use client";

import { AlertTriangle, CheckCircle, Quote } from "lucide-react";
import { DetectedMisconception, Topic } from "@/types";

interface MisconceptionCardProps {
  misconception: DetectedMisconception;
  topic: Topic;
  onRequestLesson: (misconceptionId: string, subconceptId: string) => void;
}

export default function MisconceptionCard({
  misconception,
  topic,
  onRequestLesson,
}: MisconceptionCardProps) {
  // Find the full misconception statement
  let statement = "Unknown misconception";
  for (const sub of topic.subconcepts) {
    const mc = sub.misconceptions.find((m) => m.id === misconception.id);
    if (mc) {
      statement = mc.statement;
      break;
    }
  }

  const confidencePercent = Math.round(misconception.confidence * 100);
  const isHighConfidence = misconception.confidence > 0.6;

  return (
    <div
      className="glass rounded-xl p-5 border-l-4 animate-slideUp"
      style={{
        borderLeftColor: isHighConfidence
          ? "var(--color-danger)"
          : "var(--color-warning)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isHighConfidence ? (
            <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />
          ) : (
            <CheckCircle className="w-5 h-5 text-[var(--color-warning)]" />
          )}
          <span className="font-semibold text-sm">Detected Misconception</span>
        </div>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isHighConfidence
              ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
              : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
          }`}
        >
          {confidencePercent}% match
        </span>
      </div>

      <p className="text-sm leading-relaxed mb-3">{statement}</p>

      {misconception.evidence_quote && (
        <div className="flex gap-2 items-start text-xs text-[var(--color-text-muted)] mb-4 bg-[var(--color-surface)] rounded-lg p-3">
          <Quote className="w-3 h-3 mt-0.5 shrink-0" />
          <span>&ldquo;{misconception.evidence_quote}&rdquo;</span>
        </div>
      )}

      <button
        onClick={() =>
          onRequestLesson(misconception.id, misconception.subconcept_id)
        }
        className="w-full mt-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
      >
        Teach Me With a Personalized Analogy
      </button>
    </div>
  );
}
