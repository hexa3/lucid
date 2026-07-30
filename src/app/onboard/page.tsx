"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Sparkles, ChevronLeft, Check } from "lucide-react";
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
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 3) return prev;
      return [...prev, tag];
    });
  }

  async function handleSubmit() {
    if (!name.trim() || selectedTags.length === 0) return;
    setIsSubmitting(true);
    try {
      const userId = generateUserId();
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          name: name.trim(),
          interest_tags: selectedTags,
          reading_level: "standard",
          accessibility: { highContrast: false, dyslexiaFont: false, textToSpeech: false },
        }),
      });

      sessionStorage.setItem("lucid_user_id", userId);
      sessionStorage.setItem("lucid_user_name", name.trim());
      sessionStorage.setItem("lucid_interest_tags", JSON.stringify(selectedTags));

      if (!res.ok) console.warn("User API returned error, proceeding with local session.");
      router.push("/learn");
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/")}
            className="btn btn-ghost px-4 py-2.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="font-bold text-xl gradient-text">Lucid</span>
          </div>
        </div>

        {step === "tags" && (
          <>
            <div className="mb-10" style={{ animation: "fadeIn 0.5s forwards", opacity: 0 }}>
              <div className="section-label">Personalize</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                What do you love?
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-lg">
                Pick <strong className="text-[var(--color-text)]">2–3 interests</strong>. We&apos;ll use them to explain concepts in
                ways that make sense <em className="text-[var(--color-text)]">to you</em>.
              </p>
            </div>

            <div
              className="flex flex-wrap gap-3 mb-12"
              style={{ animation: "slideUp 0.5s 0.1s forwards", opacity: 0 }}
            >
              {INTEREST_TAGS.map((tag, i) => {
                const selected = selectedTags.includes(tag);
                const icons: Record<string, string> = {
                  gaming: "🎮", sports: "⚽", music: "🎵", cooking: "🍳",
                  nature: "🌿", art: "🎨", cars: "🚗", movies: "🎬",
                  dance: "💃", technology: "💻",
                };
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={selected ? "tag active" : "tag"}
                    style={{ animation: `fadeIn 0.3s ${0.15 + i * 0.04}s forwards`, opacity: 0 }}
                  >
                    {icons[tag]} {tag}
                    {selected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            <div
              className="flex items-center justify-between"
              style={{ animation: "fadeIn 0.3s 0.4s forwards", opacity: 0 }}
            >
              <p className="text-sm text-[var(--color-text-muted)]">
                {selectedTags.length}/3 selected
                {selectedTags.length < 2 && (
                  <span className="ml-2 text-[var(--color-text-dim)]">— need at least 2</span>
                )}
              </p>
              <button
                onClick={() => selectedTags.length >= 2 && setStep("name")}
                disabled={selectedTags.length < 2}
                className="btn btn-primary text-base"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === "name" && (
          <div style={{ animation: "slideUp 0.4s forwards", opacity: 0 }}>
            <div className="mb-10">
              <div className="section-label">
                <Sparkles className="w-3.5 h-3.5" />
                Almost there!
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                What&apos;s your name?
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                This helps your teacher track your progress.
              </p>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="input text-lg mb-8"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />

            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep("tags")}
                className="btn btn-ghost"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className="btn btn-primary flex-1 justify-center text-base"
              >
                {isSubmitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
