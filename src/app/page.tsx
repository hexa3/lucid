"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Target, Zap, BarChart3, BookOpen } from "lucide-react";

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="glass rounded-xl p-6 hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-glow group"
      style={{
        animation: `fadeIn 0.5s ${delay}s forwards`,
        opacity: 0,
      }}
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/20 transition-colors">
        <Icon className="w-6 h-6 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ─── Navigation ─────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="font-bold text-lg gradient-text">Lucid</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Teacher Dashboard
            </Link>
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-lg shadow-[var(--color-primary-glow)]"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[var(--color-text-secondary)] mb-8"
            style={{ animation: "fadeIn 0.5s forwards", opacity: 0 }}
          >
            <Sparkles className="w-4 h-4 text-[var(--color-warning)]" />
            AI-Powered Concept Diagnosis
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ animation: "slideUp 0.6s forwards", opacity: 0 }}
          >
            Find exactly where
            <br />
            <span className="gradient-text">understanding breaks</span>
          </h1>

          <p
            className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ animation: "slideUp 0.7s 0.1s forwards", opacity: 0 }}
          >
            Most AI tutors check if you&apos;re right or wrong. Lucid has you
            explain a concept in your own words, then diagnoses the{" "}
            <em>specific misconception</em> behind any confusion — and teaches
            to it with a personalized analogy that actually sticks.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: "slideUp 0.7s 0.2s forwards", opacity: 0 }}
          >
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-primary)] text-white rounded-xl text-base font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-lg shadow-[var(--color-primary-glow)] animate-pulseGlow"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 glass rounded-xl text-base font-medium hover:bg-[var(--color-surface-hover)] transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              Teacher View
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
              Three simple steps. One powerful insight.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={BookOpen}
              title="1. Explain It"
              description="Pick a topic and explain it in your own words. Type or speak — however you learn best."
              delay={0}
            />
            <FeatureCard
              icon={Target}
              title="2. We Diagnose"
              description="Our two-tier AI pipeline finds the exact misconception and shows why you're stuck."
              delay={0.1}
            />
            <FeatureCard
              icon={Zap}
              title="3. Learn Your Way"
              description="Get a personalized analogy tied to your interests, a Socratic follow-up, and spaced review."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── Features Grid ──────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Lucid Is Different
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
              Built on real learning science, not chatbot tricks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-primary)]">
              <h3 className="font-semibold mb-1">Feynman Technique</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Teaching forces understanding. We use your own explanation to find gaps.
              </p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-success)]">
              <h3 className="font-semibold mb-1">Misconception Diagnosis</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Not &quot;wrong&quot; — specifically which belief is blocking you.
              </p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-accent)]">
              <h3 className="font-semibold mb-1">Personalized Analogies</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                The same concept explained through sports, gaming, cooking, or art.
              </p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-warning)]">
              <h3 className="font-semibold mb-1">Socratic Follow-Up</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                We don&apos;t give answers — we ask questions that lead you there.
              </p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-danger)]">
              <h3 className="font-semibold mb-1">Spaced Repetition</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                SM-2 algorithm resurfaces concepts right before you&apos;d forget them.
              </p>
            </div>
            <div className="glass rounded-xl p-5 border-l-4 border-l-[var(--color-primary)]">
              <h3 className="font-semibold mb-1">Live Concept Map</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Watch your understanding grow as nodes shift from red to green.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to actually understand?
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8">
            No more guessing. No more &quot;you&apos;re wrong.&quot; Just clear,
            personalized insight into what you know — and what you don&apos;t.
          </p>
          <Link
            href="/onboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-primary)] text-white rounded-xl text-base font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Lucid — Hackathon Submission</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Built for education.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
