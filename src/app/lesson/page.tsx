"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ArrowLeft, Loader2, RefreshCw, CheckCircle2,
  AlertTriangle, Sparkles, ChevronRight, FileSearch, Map, GraduationCap,
} from "lucide-react";
import ConceptMap from "@/components/ConceptMap";
import MisconceptionCard from "@/components/MisconceptionCard";
import LessonDisplay from "@/components/LessonDisplay";
import { SEED_TOPICS } from "@/lib/seed-content";
import type { Topic, DiagnosisOutput, LessonOutput } from "@/types";

const tabs = [
  { key: "diagnosis" as const, label: "Diagnosis", icon: FileSearch },
  { key: "conceptmap" as const, label: "Concept Map", icon: Map },
  { key: "lesson" as const, label: "Personalized Lesson", icon: GraduationCap },
];

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

    if (topicId) setTopic(SEED_TOPICS.find((t) => t.topic_id === topicId) ?? null);
    if (masteryStr) try { setMastery(JSON.parse(masteryStr)); } catch {}
    if (interestsStr) try { setInterestTags(JSON.parse(interestsStr)); } catch {}
    if (diagnosisStr) try { setDiagnosis(JSON.parse(diagnosisStr)); } catch {}
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
        if (!res.ok) throw new Error("Lesson generation failed");
        setLesson((await res.json()).data);
        setActiveTab("lesson");
      } catch {
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
          reading_level: newLevel,
        }),
      });
      if (!res.ok) throw new Error("Lesson generation failed");
      setLesson((await res.json()).data);
    } catch {
      alert("Failed to regenerate lesson.");
    } finally {
      setIsLoadingLesson(false);
    }
  }

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
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-lg text-[var(--color-text-muted)]">Loading diagnosis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push("/learn")} className="btn btn-ghost px-3 py-2.5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="font-bold text-xl gradient-text">Lucid</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-dim)]" />
          <span className="text-base font-medium text-[var(--color-text-secondary)]">{topic.display_name}</span>
        </div>

        {/* Diagnosis Summary */}
        <div className="mb-10" style={{ animation: "slideUp 0.4s forwards", opacity: 0 }}>
          <div className="flex items-start gap-4 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              diagnosis.detected_misconceptions.length > 0
                ? "bg-[var(--color-warning-ghost)]"
                : "bg-[var(--color-success-ghost)]"
            }`}>
              {diagnosis.detected_misconceptions.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-[var(--color-warning)]" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1.5">
                {diagnosis.detected_misconceptions.length > 0
                  ? "We found some gaps in your understanding"
                  : "Great foundation! Let's build on it."}
              </h1>
              <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed">
                {diagnosis.detected_misconceptions.length > 0
                  ? `We detected ${diagnosis.detected_misconceptions.length} misconception${diagnosis.detected_misconceptions.length !== 1 ? "s" : ""}. Here's what's going on — and how to fix it.`
                  : "Your explanation was solid! Here's a question to deepen your understanding."}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 border-b border-[var(--color-border)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab flex items-center gap-2 ${isActive ? "active" : ""}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "" : "text-[var(--color-text-dim)]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab: Diagnosis */}
        {activeTab === "diagnosis" && (
          <div className="space-y-5" style={{ animation: "fadeIn 0.4s forwards" }}>
            {diagnosis.detected_misconceptions.length > 0 ? (
              diagnosis.detected_misconceptions.map((mc, i) => (
                <div key={`${mc.id}-${i}`} style={{ animation: `slideUp 0.4s ${i * 0.1}s forwards`, opacity: 0 }}>
                  <MisconceptionCard
                    misconception={mc}
                    topic={topic}
                    onRequestLesson={handleRequestLesson}
                  />
                </div>
              ))
            ) : (
              <div className="card p-10 md:p-12 text-center">
                <CheckCircle2 className="w-14 h-14 text-[var(--color-success)] mx-auto mb-5" />
                <h3 className="text-2xl font-bold mb-3">No misconceptions detected!</h3>
                <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
                  Your explanation shows good understanding. Let&apos;s challenge you with a deeper question.
                </p>
                <div className="glass-elevated rounded-xl p-6 mb-6 max-w-lg mx-auto">
                  <p className="text-lg italic leading-relaxed">&ldquo;{diagnosis.socratic_followup}&rdquo;</p>
                </div>
                <button
                  onClick={() => router.push("/learn")}
                  className="btn btn-primary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Another Topic
                </button>
              </div>
            )}

            {/* Socratic Follow-up (always shown) */}
            <div className="card p-6 border-l-[3px] border-l-[var(--color-primary)]">
              <div className="flex items-center gap-2.5 mb-3">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="font-bold text-base">Challenge Question</span>
              </div>
              <p className="text-lg leading-relaxed italic text-[var(--color-text-secondary)]">
                {diagnosis.socratic_followup}
              </p>
            </div>
          </div>
        )}

        {/* Tab: Concept Map */}
        {activeTab === "conceptmap" && (
          <div className="card p-6 md:p-8" style={{ animation: "fadeIn 0.4s forwards" }}>
            <h2 className="text-2xl font-bold mb-2">Your Understanding Map</h2>
            <p className="text-base text-[var(--color-text-secondary)] mb-8">
              Nodes shift from <span className="text-[var(--color-danger)]">red</span> →{" "}
              <span className="text-[var(--color-warning)]">yellow</span> →{" "}
              <span className="text-[var(--color-success)]">green</span> as your mastery improves.
            </p>
            {conceptNodes.length > 0 ? (
              <ConceptMap nodes={conceptNodes} />
            ) : (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No data to visualize yet. Start learning!</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <span className="status-dot low" />
                <span className="text-sm text-[var(--color-text-muted)]">Low mastery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="status-dot mid" />
                <span className="text-sm text-[var(--color-text-muted)]">Developing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="status-dot high" />
                <span className="text-sm text-[var(--color-text-muted)]">Mastered</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Personalized Lesson */}
        {activeTab === "lesson" && (
          <div style={{ animation: "fadeIn 0.4s forwards" }}>
            {isLoadingLesson ? (
              <div className="card p-16 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-5" />
                <p className="text-lg text-[var(--color-text-muted)]">Crafting your personalized lesson...</p>
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
              <div className="card p-12 md:p-16 text-center">
                <GraduationCap className="w-14 h-14 text-[var(--color-primary)] mx-auto mb-5" />
                <h3 className="text-2xl font-bold mb-3">Ready for a personalized lesson?</h3>
                <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
                  Select a misconception from the <strong>Diagnosis</strong> tab to get a
                  personalized analogy based on your interests.
                </p>
                <button
                  onClick={() => setActiveTab("diagnosis")}
                  className="btn btn-primary"
                >
                  <FileSearch className="w-4 h-4" />
                  Go to Diagnosis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
