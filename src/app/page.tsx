"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Target, Zap, BookOpen, BarChart3, Lightbulb, RefreshCw } from "lucide-react";

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
    <div            className="card card-interactive group p-6 md:p-7"
      style={{
        animation: `slideUp 0.5s ${delay}s forwards`,
        opacity: 0,
      }}
    >
      <div className="w-14 h-14 rounded-xl bg-[var(--color-primary-ghost)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] leading-relaxed">
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
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-ghost)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <span className="font-bold text-xl gradient-text">Lucid</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-sm md:text-base text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors font-medium"
            >
              Teacher Dashboard
            </Link>
            <Link
              href="/onboard"
              className="btn btn-primary text-sm md:text-base"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────── */}
      <section className="pt-36 md:pt-44 pb-24 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="section-label mx-auto"
            style={{ animation: "fadeIn 0.5s forwards", opacity: 0 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Concept Diagnosis
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 md:mb-8"
            style={{ animation: "slideUp 0.6s forwards", opacity: 0 }}
          >
            Find exactly where
            <br />
            <span className="gradient-text">understanding breaks</span>
          </h1>

          <p
            className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12"
            style={{ animation: "slideUp 0.7s 0.1s forwards", opacity: 0 }}
          >
            Most AI tutors check if you&apos;re right or wrong. Lucid has you
            explain a concept in your own words, then diagnoses the{" "}
            <em className="text-[var(--color-text)]">specific misconception</em> behind any confusion — and teaches
            to it with a personalized analogy that actually sticks.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: "slideUp 0.7s 0.2s forwards", opacity: 0 }}
          >
            <Link
              href="/onboard"
              className="btn btn-primary text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4 animate-pulseGlow"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-ghost text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4"
            >
              <BarChart3 className="w-5 h-5" />
              Teacher View
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <div className="section-label mx-auto">How It Works</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Three simple steps.
            </h2>
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-lg mx-auto">
              One powerful insight into how you learn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={BookOpen}
              title="1. Explain It"
              description="Pick a topic and explain it in your own words. Type or speak — however you learn best."
              delay={0}
            />
            <FeatureCard
              icon={Target}
              title="2. We Diagnose"
              description="Our two-tier AI pipeline finds the exact misconception and shows why you&apos;re stuck."
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
      <section className="py-20 md:py-28 px-6 bg-[var(--color-surface)]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <div className="section-label mx-auto">Why Lucid</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Built on learning science,
            </h2>
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-lg mx-auto">
              not chatbot tricks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Lightbulb, title: "Feynman Technique", desc: "Teaching forces understanding. We use your own explanation to find gaps.", color: "var(--color-primary)" },
              { icon: Target, title: "Misconception Diagnosis", desc: 'Not "wrong" — specifically which belief is blocking you.', color: "var(--color-success)" },
              { icon: Zap, title: "Personalized Analogies", desc: "The same concept explained through sports, gaming, cooking, or art.", color: "var(--color-accent)" },
              { icon: RefreshCw, title: "Socratic Follow-Up", desc: "We don't give answers — we ask questions that lead you there.", color: "var(--color-warning)" },
              { icon: BookOpen, title: "Spaced Repetition", desc: "SM-2 algorithm resurfaces concepts right before you forget them.", color: "var(--color-danger)" },
              { icon: Brain, title: "Live Concept Map", desc: "Watch your understanding grow as nodes shift from red to green.", color: "var(--color-primary)" },
            ].map((f, i) => (
              <div
                key={i}
                className="card p-6 border-l-[3px]"
                style={{
                  borderLeftColor: f.color,
                  animation: `fadeIn 0.5s ${i * 0.08}s forwards`,
                  opacity: 0,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${f.color}15` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-[1.0625rem] font-bold mb-1.5">{f.title}</h3>
                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center glass-elevated rounded-2xl p-10 md:p-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            Ready to actually understand?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto leading-relaxed">
            No more guessing. No more &quot;you&apos;re wrong.&quot; Just clear,
            personalized insight into what you know — and what you don&apos;t.
          </p>
          <Link
            href="/onboard"
            className="btn btn-primary text-base md:text-lg px-8 md:px-10 py-3.5"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-dim)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[var(--color-primary-ghost)] flex items-center justify-center">
              <Brain className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <span className="font-semibold">Lucid</span>
            <span className="mx-2">—</span>
            <span>Hackathon Submission</span>
          </div>
          <div className="flex items-center gap-5">
            <span>Built for the Prometheus Hackathon 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
