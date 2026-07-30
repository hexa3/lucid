"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Sparkles, ChevronLeft } from "lucide-react";
import { INTEREST_TAGS, generateUserId } from "@/lib/store";
import type { InterestTag } from "@/types";

export default function OnboardPage() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<InterestTag[]>([]);
  const [name, setName] = useState("");
  const [step, setStep] = useState<"tags" | "name">("tags");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleTag(tag: InterestTag) {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 3) return prev; // Max 3 tags
      return [...prev, tag];
    });
  }

  async function handleSubmit() {
    if (!name.trim() || selectedTags.length === 0) return;

    setIsSubmitting(true);
    try {
      const userId = generateUserId();
      const user = {
        id: userId,
        name: name.trim(),
        interest_tags: selectedTags,
        reading_level: "standard" as const,
        accessibility: {
          highContrast: false,
          dyslexiaFont: false,
          textToSpeech: false,
        },
      };

      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      // Store user ID in sessionStorage regardless of API success
      // (fallback for demo resilience)
      sessionStorage.setItem("lucid_user_id", userId);
      sessionStorage.setItem("lucid_user_name", name.trim());
      sessionStorage.setItem(
        "lucid_interest_tags",
        JSON.stringify(selectedTags)
      );

      if (!res.ok) {
        console.warn("User API returned error, proceeding with local session.");
      }
      router.push("/learn");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Brain className="w-8 h-8 text-[var(--color-primary)]" />
          <span className="font-bold text-2xl gradient-text">Lucid</span>
        </div>

        {step === "tags" && (
          <>
            <div className="mb-8 animate-fadeIn">
              <h1 className="text-3xl font-bold mb-3">
                What do you love?
              </h1>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Pick 2–3 interests. We&apos;ll use them to explain concepts in
                ways that make sense{" "}
                <span className="italic">to you</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-10 animate-slideUp">
              {INTEREST_TAGS.map((tag, i) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag text-base capitalize px-5 py-2.5 transition-all duration-200 ${
                    selectedTags.includes(tag) ? "active" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {tag === "gaming" && "🎮 "}
                  {tag === "sports" && "⚽ "}
                  {tag === "music" && "🎵 "}
                  {tag === "cooking" && "🍳 "}
                  {tag === "nature" && "🌿 "}
                  {tag === "art" && "🎨 "}
                  {tag === "cars" && "🚗 "}
                  {tag === "movies" && "🎬 "}
                  {tag === "dance" && "💃 "}
                  {tag === "technology" && "💻 "}
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--color-text-muted)]">
                {selectedTags.length}/3 selected
              </p>
              <button
                onClick={() => {
                  if (selectedTags.length >= 2) setStep("name");
                }}
                disabled={selectedTags.length < 2}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === "name" && (
          <div className="animate-slideUp">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--color-warning)]" />
                <span className="text-sm text-[var(--color-text-muted)]">
                  Almost there!
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-3">
                What&apos;s your name?
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                This helps your teacher track your progress.
              </p>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-5 py-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200 mb-6"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("tags")}
                className="px-6 py-3 glass rounded-xl text-sm font-medium hover:bg-[var(--color-surface-hover)] transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Start Learning
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
