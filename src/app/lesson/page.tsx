"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  ArrowLeft,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import ConceptMap from "@/components/ConceptMap";
import MisconceptionCard from "@/components/MisconceptionCard";
import LessonDisplay from "@/components/LessonDisplay";
import { SEED_TOPICS } from "@/lib/seed-content";
import type { Topic, DiagnosisOutput, LessonOutput } from "@/types";

export default function LessonPage() {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState<DiagnosisOutput | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lesson, setLesson] = useState<LessonOutput | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnosis" | "conceptmap" | "lesson">("diagnosis");
  const [mastery, setMastery] = useState<Record<string, number>>({});
  const [readingLevel, setReadingLevel] = useState<"simple" | "standard" | "advanced">("standard");
  const [interestTags, setInterestTags] = useState<string[]>(["nature"]);

  useEffect(() => {
    const topicId = sessionStorage.getItem("lucid_current_topic_id");
    const masteryStr = sessionStorage.getItem("lucid_mastery");
    const interestsStr = sessionStorage.getItem("lucid_interest_tags");
    const diagnosisStr = sessionStorage.getItem("lucid_diagnosis_result");

    if (topicId) {
      const foundTopic = SEED_TOPICS.find((t) => t.topic_id === topicId);
      setTopic(foundTopic ?? null);
    }

    if (masteryStr) {
      try {
        setMastery(JSON.parse(masteryStr));
      } catch {}
    }

    if (interestsStr) {
      try {
        setInterestTags(JSON.parse(interestsStr));
      } catch {}
    }

    if (diagnosisStr) {
      try {
        setDiagnosis(JSON.parse(diagnosisStr));
      } catch {}
    }
  }, []);

  const handleRequestLesson = useCallback(
    async (misconceptionId: string, subconceptId: string) => {
      if (!topic) return;
      setIsLoadingLesson(true);

      try {
        const res = await fetch("/api/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic_id: topic.topic_id,
            misconception_id: misconceptionId,
            subconcept_id: subconceptId,
            interest_tags: interestTags,
            reading_level: readingLevel,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Lesson generation failed");
        }

        const json = await res.json();
        setLesson(json.data);
        setActiveTab("lesson");
      } catch (err) {
        console.error("Lesson error:", err);
        alert("Failed to generate lesson. Please try again.");
      } finally {
        setIsLoadingLesson(false);
      }
    },
    [topic, interestTags, readingLevel]
  );

  async function handleRegenerateLesson(newLevel: "simple" | "standard" | "advanced") {
    setReadingLevel(newLevel);
    if (!topic || !diagnosis || diagnosis.detected_misconceptions.length === 0) return;
    setIsLoadingLesson(true);
    const first = diagnosis.detected_misconceptions[0];
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: topic.topic_id,
          misconception_id: first.id,
          subconcept_id: first.subconcept_id,
          interest_tags: interestTags,
          reading_level: newLevel, // Use the new level directly, not state
        }),
      });
      if (!res.ok) throw new Error("Lesson generation failed");
      const json = await res.json();
      setLesson(json.data);
    } catch (err) {
      console.error("Lesson error:", err);
      alert("Failed to generate lesson. Please try again.");
    } finally {
      setIsLoadingLesson(false);
    }
  }

  // Build concept map nodes from mastery
  const conceptNodes = topic
    ? topic.subconcepts.map((sub) => ({
        id: sub.id,
        label: sub.label,
        mastery: mastery[sub.id] ?? 0.5,
        topicId: topic.topic_id,
      }))
    : [];

  if (!diagnosis || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading diagnosis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/learn")}
            className="p-2 glass rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="font-bold gradient-text text-lg">Lucid</span>
          </div>
          <span className="text-sm text-[var(--color-text-muted)] mx-2">/</span>
          <span className="text-sm">{topic.display_name}</span>
        </div>

        {/* ─── Diagnosis Summary ────────────────────── */}
        <div className="mb-8 animate-slideUp">
          <div className="flex items-center gap-3 mb-3">
            {diagnosis.detected_misconceptions.length > 0 ? (
              <AlertTriangle className="w-6 h-6 text-[var(--color-warning)]" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
            )}
            <h1 className="text-2xl font-bold">
              {diagnosis.detected_misconceptions.length > 0
                ? "We found some gaps in your understanding"
                : "Great foundation! Let's build on it."}
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)]">
            {diagnosis.detected_misconceptions.length > 0
              ? `We detected ${diagnosis.detected_misconceptions.length} misconception${diagnosis.detected_misconceptions.length !== 1 ? "s" : ""}. Here's what's going on — and how to fix it.`
              : "Your explanation was solid! Here's a question to deepen your understanding."}
          </p>
        </div>

        {/* ─── Tab Navigation ────────────────────────── */}
        <div className="flex gap-2 mb-8 border-b border-[var(--color-border)]">
          {([
            { key: "diagnosis", label: "Diagnosis" },
            { key: "conceptmap", label: "Concept Map" },
            { key: "lesson", label: "Personalized Lesson" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.key
                  ? "border-[var(--color-primary)] text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Diagnosis ────────────────────────── */}
        {activeTab === "diagnosis" && (
          <div className="space-y-4 animate-fadeIn">
            {diagnosis.detected_misconceptions.length > 0 ? (
              diagnosis.detected_misconceptions.map((mc, i) => (
                <MisconceptionCard
                  key={`${mc.id}-${i}`}
                  misconception={mc}
                  topic={topic}
                  onRequestLesson={handleRequestLesson}
                />
              ))
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-[var(--color-success)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No misconceptions detected!
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
                  Your explanation shows good understanding. Let&apos;s challenge
                  you with a deeper question.
                </p>
                <p className="text-base italic glass-light rounded-lg p-4 mb-4">
                  &ldquo;{diagnosis.socratic_followup}&rdquo;
                </p>
                <button
                  onClick={() => router.push("/learn")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Another Topic
                </button>
              </div>
            )}

            {/* Socratic Follow-up (always shown) */}
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-primary)]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-semibold">Challenge Question</span>
              </div>
              <p className="text-base leading-relaxed italic">
                {diagnosis.socratic_followup}
              </p>
            </div>
          </div>
        )}

        {/* ─── Tab: Concept Map ──────────────────────── */}
        {activeTab === "conceptmap" && (
          <div className="glass rounded-xl p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold mb-2">
              Your Understanding Map
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Nodes shift from red → yellow → green as your mastery improves.
            </p>
            {conceptNodes.length > 0 ? (
              <ConceptMap nodes={conceptNodes} />
            ) : (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                No data to visualize yet. Start learning!
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
                <span className="text-xs text-[var(--color-text-muted)]">
                  Low mastery
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
                <span className="text-xs text-[var(--color-text-muted)]">
                  Developing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
                <span className="text-xs text-[var(--color-text-muted)]">
                  Mastered
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Personalized Lesson ──────────────── */}
        {activeTab === "lesson" && (
          <div className="animate-fadeIn">
            {isLoadingLesson ? (
              <div className="glass rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
                <p className="text-[var(--color-text-muted)]">
                  Crafting your personalized lesson...
                </p>
              </div>
            ) : lesson ? (
              <LessonDisplay
                lesson={lesson}
                interestTag={interestTags[0] || "nature"}
                readingLevel={readingLevel}
                onRegenerate={handleRegenerateLesson}
                onComplete={() => router.push("/learn")}
              />
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <Sparkles className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Ready for a personalized lesson?
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  Select a misconception from the Diagnosis tab to get a
                  personalized analogy based on your interests.
                </p>
                <button
                  onClick={() => setActiveTab("diagnosis")}
                  className="text-[var(--color-primary)] hover:underline text-sm"
                >
                  ← Go to Diagnosis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
