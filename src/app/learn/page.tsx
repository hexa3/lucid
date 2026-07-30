"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ArrowLeft, Loader2, BookOpen, ChevronRight,
  Mic, MicOff, Sparkles, ChevronLeft,
} from "lucide-react";

interface TopicData {
  topic_id: string;
  display_name: string;
  subconcept_count: number;
  subconcepts: Array<{ id: string; label: string; misconception_count: number }>;
}

const domainIcons: Record<string, string> = {
  newtons_second_law: "⚡",
  photosynthesis: "🌱",
  recursion: "🔄",
  cognitive_biases: "🧠",
};

export default function LearnPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/topics");
        if (!res.ok) throw new Error("Failed to load topics");
        setTopics((await res.json()).data.topics);
      } catch {
        setError("Failed to load topics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function handleSubmit() {
    if (!explanation.trim() || !selectedTopic) return;
    const userId = sessionStorage.getItem("lucid_user_id") || "demo_user_001";

    sessionStorage.setItem("lucid_current_topic_id", selectedTopic.topic_id);
    sessionStorage.setItem("lucid_current_topic_name", selectedTopic.display_name);
    sessionStorage.setItem("lucid_current_explanation", explanation.trim());

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: selectedTopic.topic_id,
          student_explanation_text: explanation.trim(),
          user_id: userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Diagnosis failed");
      }

      const json = await res.json();
      sessionStorage.setItem("lucid_diagnosis_result", JSON.stringify(json.data));
      if (json.data.updated_mastery) {
        sessionStorage.setItem("lucid_mastery", JSON.stringify(json.data.updated_mastery));
      }
      router.push("/lesson");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleVoiceInput() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Please type instead.");
      return;
    }
    if (isListening) { setIsListening(false); return; }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported."); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    setIsListening(true);

    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) setExplanation((prev) => (prev ? `${prev} ${final}` : final));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)] text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => router.push("/")} className="btn btn-ghost px-3 py-2.5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="font-bold text-xl gradient-text">Lucid</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 glass-elevated rounded-xl border-l-[3px] border-l-[var(--color-danger)]" style={{ animation: "slideUp 0.3s forwards" }}>
            <p className="text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {!selectedTopic ? (
          <>
            {/* Topic Selection */}
            <div className="mb-10" style={{ animation: "fadeIn 0.5s forwards", opacity: 0 }}>
              <div className="section-label">Step 1 of 2</div>
              <h1 className="text-3xl md:text-4xl font-bold mt-1 mb-4">
                What do you want to learn?
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Pick a topic to explain in your own words.
              </p>
            </div>

            <div className="grid gap-4" style={{ animation: "slideUp 0.5s 0.1s forwards", opacity: 0 }}>
              {topics.map((topic, i) => (
                <button
                  key={topic.topic_id}
                  onClick={() => setSelectedTopic(topic)}
                  className="card card-interactive p-5 md:p-6 text-left"
                  style={{ animation: `fadeIn 0.4s ${0.15 + i * 0.08}s forwards`, opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl md:text-3xl">{domainIcons[topic.topic_id] || "📘"}</span>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">{topic.display_name}</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                          {topic.subconcept_count} sub-concepts to master
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--color-text-dim)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Explain In Your Own Words */}
            <div className="mb-8" style={{ animation: "fadeIn 0.5s forwards", opacity: 0 }}>
              <button
                onClick={() => setSelectedTopic(null)}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline mb-5"
              >
                <ChevronLeft className="w-4 h-4" />
                Change topic
              </button>
              <div className="section-label">Step 2 of 2</div>
              <h1 className="text-3xl md:text-4xl font-bold mt-1 mb-4">
                Explain it in your own words
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)]">
                Topic: <span className="text-[var(--color-text)] font-semibold">{selectedTopic.display_name}</span>
              </p>
            </div>

            <div className="card p-6 md:p-8" style={{ animation: "slideUp 0.5s 0.1s forwards", opacity: 0 }}>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={`Explain ${selectedTopic.display_name} like you're teaching it to someone who knows nothing about it. Use examples, be specific — don't worry about being perfect.`}
                className="textarea w-full min-h-[220px] mb-5"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-xl transition-all ${
                      isListening
                        ? "bg-[var(--color-danger)] text-white animate-pulse shadow-lg"
                        : "btn btn-ghost px-4 py-3"
                    }`}
                    title={isListening ? "Stop recording" : "Speak your explanation"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {explanation.length > 0
                      ? `${explanation.length} characters`
                      : "Type or speak"}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={explanation.trim().length < 10 || isSubmitting}
                  className="btn btn-primary text-base w-full sm:w-auto justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Diagnosing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze My Understanding
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
