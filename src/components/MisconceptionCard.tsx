"use client";

import { AlertTriangle, Quote, ChevronRight } from "lucide-react";
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
  let statement = "Unknown misconception";
  for (const sub of topic.subconcepts) {
    const mc = sub.misconceptions.find((m) => m.id === misconception.id);
    if (mc) { statement = mc.statement; break; }
  }

  const confidencePercent = Math.round(misconception.confidence * 100);
  const isHighConfidence = misconception.confidence > 0.6;

  return (
    <div
      className="card p-6 border-l-[3px]"
      style={{
        borderLeftColor: isHighConfidence ? "var(--color-danger)" : "var(--color-warning)",
        animation: "slideUp 0.4s forwards",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isHighConfidence ? "bg-[var(--color-danger-ghost)]" : "bg-[var(--color-warning-ghost)]"
          }`}>
            {isHighConfidence ? (
              <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
            )}
          </div>
          <div>
            <span className="font-bold text-base">Detected Misconception</span>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Possible gap in your understanding
            </p>
          </div>
        </div>
        <span className={`badge shrink-0 ${
          isHighConfidence ? "badge-danger" : "badge-warning"
        }`}>
          {confidencePercent}% match
        </span>
      </div>

      {/* Statement */}
      <p className="text-base md:text-lg leading-relaxed mb-4 text-[var(--color-text)] font-medium">
        &ldquo;{statement}&rdquo;
      </p>

      {/* Evidence Quote */}
      {misconception.evidence_quote && (
        <div className="flex gap-3 items-start text-sm text-[var(--color-text-muted)] mb-5 bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <Quote className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <span className="italic leading-relaxed">&ldquo;{misconception.evidence_quote}&rdquo;</span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onRequestLesson(misconception.id, misconception.subconcept_id)}
        className="btn btn-primary w-full justify-center text-base"
      >
        Teach Me With a Personalized Analogy
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
