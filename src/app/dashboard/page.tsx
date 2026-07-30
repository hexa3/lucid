"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ArrowLeft, Loader2, BarChart3, RefreshCw,
  Users, Lightbulb, GraduationCap, Layers,
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
      setSummary((await res.json()).data);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadSummary(); }, []);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="btn btn-ghost px-3 py-2.5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <Brain className="w-6 h-6 text-[var(--color-primary)]" />
              <span className="font-bold text-xl gradient-text">Lucid</span>
            </div>
            <span className="text-[var(--color-text-dim)] mx-1">/</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="font-bold text-lg">Teacher Dashboard</span>
            </div>
          </div>
          <button
            onClick={loadSummary}
            disabled={isLoading}
            className="btn btn-ghost"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-5 card border-l-[3px] border-l-[var(--color-danger)]" style={{ animation: "slideUp 0.3s forwards" }}>
            <p className="text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
              <p className="text-lg text-[var(--color-text-muted)]">Loading dashboard...</p>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-8">
            {/* Stats overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ animation: "fadeIn 0.5s forwards", opacity: 0 }}>
              {[
                { icon: Users, value: summary.students.length, label: "Students", color: "var(--color-primary)" },
                { icon: Layers, value: Object.keys(summary.subconcept_mastery_matrix).length, label: "Sub-Concepts Tracked", color: "var(--color-success)" },
                { icon: Lightbulb, value: summary.misconception_count, label: "Active Misconceptions", color: "var(--color-warning)" },
              ].map((stat, i) => (
                <div key={i} className="card p-6 flex items-center gap-5" style={{ animation: `slideUp 0.4s ${0.1 + i * 0.08}s forwards`, opacity: 0 }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stat.color}15` }}>
                    <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap */}
            <TeacherHeatmap summary={summary} />

            {/* No students hint */}
            {summary.students.length === 0 && (
              <div className="card p-8 text-center" style={{ animation: "fadeIn 0.5s 0.2s forwards", opacity: 0 }}>
                <Users className="w-12 h-12 text-[var(--color-text-dim)] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Students Yet</h3>
                <p className="text-base text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto leading-relaxed">
                  Students will appear here as they complete lessons.
                  Ask them to start at the onboarding page.
                </p>
                <button onClick={() => router.push("/onboard")} className="btn btn-primary">
                  <GraduationCap className="w-4 h-4" />
                  Demonstrate as a Student
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 text-[var(--color-text-muted)]">
            <BarChart3 className="w-14 h-14 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
