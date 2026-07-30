"use client";

import { useState } from "react";
import {
  Lightbulb, MessageCircleQuestion, BookOpen,
  ChevronDown, ChevronUp, Volume2, VolumeX, Check,
} from "lucide-react";
import { LessonOutput } from "@/types";

interface LessonDisplayProps {
  lesson: LessonOutput;
  interestTag: string;
  readingLevel?: "simple" | "standard" | "advanced";
  onRegenerate?: (readingLevel: "simple" | "standard" | "advanced") => void;
  onComplete?: () => void;
}

export default function LessonDisplay({
  lesson,
  interestTag,
  readingLevel = "standard",
  onRegenerate,
  onComplete,
}: LessonDisplayProps) {
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  function handleTextToSpeech() {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(
      `${lesson.analogy_text}. ${lesson.full_explanation}`
    );
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  const levels = [
    { key: "simple" as const, label: "Simple" },
    { key: "standard" as const, label: "Standard" },
    { key: "advanced" as const, label: "Advanced" },
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Analogy */}
      <div
        className="card p-6 md:p-7 border-l-[3px] border-l-[var(--color-accent)]"
        style={{ animation: "slideUp 0.4s 0.05s forwards", opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-ghost)] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <span className="font-bold text-lg">Through {interestTag}</span>
              <p className="text-sm text-[var(--color-text-muted)]">Personalized analogy</p>
            </div>
          </div>
          <span className="badge badge-primary">{readingLevel}</span>
        </div>
        <p className="text-base md:text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {lesson.analogy_text}
        </p>
      </div>

      {/* Socratic Follow-up */}
      <div
        className="card p-6 md:p-7 border-l-[3px] border-l-[var(--color-warning)]"
        style={{ animation: "slideUp 0.4s 0.1s forwards", opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-ghost)] flex items-center justify-center">
            <MessageCircleQuestion className="w-5 h-5 text-[var(--color-warning)]" />
          </div>
          <div>
            <span className="font-bold text-lg">Think About This</span>
            <p className="text-sm text-[var(--color-text-muted)]">Socratic follow-up</p>
          </div>
        </div>
        <p className="text-base md:text-lg leading-relaxed italic text-[var(--color-text-secondary)]">
          {lesson.socratic_question}
        </p>
      </div>

      {/* Full Explanation (collapsible) */}
      <div
        className="card"
        style={{ animation: "slideUp 0.4s 0.15s forwards", opacity: 0 }}
      >
        <button
          onClick={() => setShowFullExplanation(!showFullExplanation)}
          className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-[var(--color-surface-hover)] transition-colors rounded-[inherit]"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-bold text-base">Full Explanation</span>
          </div>
          {showFullExplanation ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
          )}
        </button>
        {showFullExplanation && (
          <div className="px-5 md:px-6 pb-6">
            <div className="divider mt-0" />
            <div className="prose text-base leading-relaxed">
              {lesson.full_explanation}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div
        className="flex flex-wrap items-center gap-3"
        style={{ animation: "fadeIn 0.4s 0.2s forwards", opacity: 0 }}
      >
        {/* TTS */}
        <button
          onClick={handleTextToSpeech}
          className={`btn ${isSpeaking ? "bg-[var(--color-accent)] text-white shadow-lg" : "btn-ghost"}`}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isSpeaking ? "Stop" : "Listen"}
        </button>

        {/* Reading Level */}
        {onRegenerate && (
          <div className="flex items-center gap-1.5 ml-2">
            {levels.map((level) => (
              <button
                key={level.key}
                onClick={() => onRegenerate(level.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  readingLevel === level.key
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "btn btn-ghost"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        )}

        {/* Mark Complete */}
        {onComplete && (
          <button
            onClick={onComplete}
            className="btn btn-success ml-auto"
          >
            <Check className="w-4 h-4" />
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
