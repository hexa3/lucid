"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  ArrowLeft,
  Send,
  Loader2,
  BookOpen,
  ChevronRight,
  Mic,
  MicOff,
  Sparkles,
} from "lucide-react";

interface TopicData {
  topic_id: string;
  display_name: string;
  subconcept_count: number;
  subconcepts: Array<{
    id: string;
    label: string;
    misconception_count: number;
  }>;
}

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
    async function loadTopics() {
      try {
        const res = await fetch("/api/topics");
        if (!res.ok) throw new Error("Failed to load topics");
        const json = await res.json();
        setTopics(json.data.topics);
      } catch (err) {
        setError("Failed to load topics. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTopics();
  }, []);

  async function handleSubmit() {
    if (!explanation.trim() || !selectedTopic) return;

    const userId =
      sessionStorage.getItem("lucid_user_id") || "demo_user_001";

    // Save these for the lesson page
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
      sessionStorage.setItem(
        "lucid_diagnosis_result",
        JSON.stringify(json.data)
      );

      // Save mastery for the concept map
      if (json.data.updated_mastery) {
        sessionStorage.setItem(
          "lucid_mastery",
          JSON.stringify(json.data.updated_mastery)
        );
      }

      router.push("/lesson");
    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong. Please try again with a longer explanation."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleVoiceInput() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Please type instead.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setExplanation((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
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
        </div>

        {error && (
          <div className="mb-6 p-4 glass rounded-xl border-l-4 border-l-[var(--color-danger)] animate-slideUp">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          </div>
        )}

        {!selectedTopic ? (
          <>
            {/* Topic Selection */}
            <div className="mb-8 animate-fadeIn">
              <span className="text-xs text-[var(--color-primary)] font-mono uppercase tracking-wider">
                Step 1 of 2
              </span>
              <h1 className="text-3xl font-bold mt-2 mb-3">
                What do you want to learn?
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Pick a topic to explain in your own words.
              </p>
            </div>

            <div className="grid gap-4 animate-slideUp">
              {topics.map((topic, i) => (
                <button
                  key={topic.topic_id}
                  onClick={() => setSelectedTopic(topic)}
                  className="glass rounded-xl p-5 text-left hover:border-[var(--color-primary)] transition-all duration-200 group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold">{topic.display_name}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {topic.subconcept_count} sub-concepts to master
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Explain In Your Own Words */}
            <div className="mb-8 animate-fadeIn">
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-xs text-[var(--color-primary)] hover:underline mb-4 inline-block"
              >
                ← Change topic
              </button>
              <span className="text-xs text-[var(--color-primary)] font-mono uppercase tracking-wider">
                Step 2 of 2
              </span>
              <h1 className="text-3xl font-bold mt-2 mb-2">
                Explain it in your own words
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Topic:{" "}
                <span className="text-[var(--color-text)] font-medium">
                  {selectedTopic.display_name}
                </span>
              </p>
            </div>

            <div className="glass rounded-xl p-6 animate-slideUp">
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={`Explain ${selectedTopic.display_name} like you're teaching it to someone who knows nothing about it. Use examples, be specific — don't worry about being perfect.`}
                className="w-full min-h-[200px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] resize-y focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVoiceInput}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      isListening
                        ? "bg-[var(--color-danger)] text-white animate-pulse"
                        : "glass hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
                    }`}
                    title={
                      isListening ? "Stop recording" : "Speak your explanation"
                    }
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {explanation.length > 0
                      ? `${explanation.length} characters`
                      : "Type or speak your explanation"}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={
                    explanation.trim().length < 10 || isSubmitting
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
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
