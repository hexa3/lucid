"use client";

import { useState } from "react";
import {
  Lightbulb,
  MessageCircleQuestion,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Volume2,
  RefreshCw,
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
    if ("speechSynthesis" in window) {
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
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  const readingLevelLabel =
    readingLevel === "simple"
      ? "Simple"
      : readingLevel === "advanced"
        ? "Advanced"
        : "Standard";

  return (
    <div className="space-y-6">
      {/* ─── Personalized Analogy ──────────────────── */}
      <div
        className="glass rounded-xl p-6 border-l-4 border-l-[var(--color-accent)] animate-slideUp"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-[var(--color-accent)]" />
          <span className="font-semibold">
            Through {interestTag} 🎯
          </span>
          <span className="ml-auto text-xs text-[var(--color-text-muted)] px-2 py-0.5 rounded-full bg-[var(--color-surface)]">
            {readingLevelLabel}
          </span>
        </div>
        <p className="text-base leading-relaxed">{lesson.analogy_text}</p>
      </div>

      {/* ─── Socratic Follow-up ────────────────────── */}
      <div
        className="glass rounded-xl p-6 border-l-4 border-l-[var(--color-warning)] animate-slideUp"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageCircleQuestion className="w-5 h-5 text-[var(--color-warning)]" />
          <span className="font-semibold">Think About This</span>
        </div>
        <p className="text-base leading-relaxed italic">
          {lesson.socratic_question}
        </p>
      </div>

      {/* ─── Full Explanation (collapsible) ────────── */}
      <div
        className="glass rounded-xl animate-slideUp"
        style={{ animationDelay: "0.3s" }}
      >
        <button
          onClick={() => setShowFullExplanation(!showFullExplanation)}
          className="w-full flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-semibold">Full Explanation</span>
          </div>
          {showFullExplanation ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </button>
        {showFullExplanation && (
          <div className="px-5 pb-5">
            <div className="prose text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {lesson.full_explanation}
            </div>
          </div>
        )}
      </div>

      {/* ─── Action Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
        {/* TTS */}
        <button
          onClick={isSpeaking ? stopSpeaking : handleTextToSpeech}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isSpeaking
              ? "bg-[var(--color-accent)] text-white"
              : "glass hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          {isSpeaking ? "Stop" : "Listen"}
        </button>

        {/* Reading level toggle */}
        {onRegenerate && (
          <div className="flex items-center gap-2">
            {(["simple", "standard", "advanced"] as const).map((level) => (
              <button
                key={level}
                onClick={() => onRegenerate(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  readingLevel === level
                    ? "bg-[var(--color-primary)] text-white"
                    : "glass hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                {level === "simple" ? "Simple" : level === "advanced" ? "Advanced" : "Standard"}
              </button>
            ))}
          </div>
        )}

        {/* Mark Complete */}
        {onComplete && (
          <button
            onClick={onComplete}
            className="ml-auto inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-success)] text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
