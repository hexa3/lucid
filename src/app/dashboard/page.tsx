"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  ArrowLeft,
  Loader2,
  BarChart3,
  RefreshCw,
  Users,
  Lightbulb,
} from "lucide-react";
import TeacherHeatmap from "@/components/TeacherHeatmap";
import { ClassSummary } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/class-summary");
      if (!res.ok) throw new Error("Failed to load class summary");
      const json = await res.json();
      setSummary(json.data);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 glass rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-[var(--color-primary)]" />
              <span className="font-bold gradient-text text-lg">Lucid</span>
            </div>
            <span className="text-sm text-[var(--color-text-muted)] mx-2">/</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="font-semibold">Teacher Dashboard</span>
            </div>
          </div>
          <button
            onClick={loadSummary}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-lg text-sm hover:bg-[var(--color-surface-hover)] transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 glass rounded-xl border-l-4 border-l-[var(--color-danger)]">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : summary ? (
          <div className="space-y-8">
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="glass rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.students.length}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Students</p>
                </div>
              </div>
              <div className="glass rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Object.keys(summary.subconcept_mastery_matrix).length}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">Sub-Concepts Tracked</p>
                </div>
              </div>
              <div className="glass rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-[var(--color-warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.misconception_count}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Active Misconceptions</p>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <TeacherHeatmap summary={summary} />

            {/* Mock data hint */}
            {summary.students.length === 0 && (
              <div className="glass rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No Students Yet</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  Students will appear here as they complete lessons.
                  Ask them to start at the onboarding page.
                </p>
                <button
                  onClick={() => router.push("/onboard")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200"
                >
                  Demonstrate as a Student
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}
