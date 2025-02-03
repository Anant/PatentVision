// pages/analysis.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ConversationPanel } from "@/components/Analysis/ConversationPanel";
import { AnalysisPanel } from "@/components/Analysis/AnalysisPanel";
import { SuggestedQuestions } from "@/components/Analysis/SuggestedQuestions";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Analysis() {
  const router = useRouter();
  const { analysisId, persona = "" } = router.query;
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Poll for analysis updates every 3 seconds.
  useEffect(() => {
    if (!analysisId) return;
    const intervalId = setInterval(async () => {
      const res = await fetch(`/api/analysis-status?analysisId=${analysisId}`);
      const data = await res.json();
      setAnalysisData(data);

      // If status is "done" or "error", stop polling
      if (data.status === "done" || data.status === "error") {
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [analysisId]);

  // Build shareUrl if analysisId is present.
  const isBrowser = typeof window !== "undefined";
  const shareUrl =
    isBrowser && analysisId ? `${window.location.origin}/analysis/${analysisId}` : null;

  // Clipboard copy logic
  function handleCopy() {
    if (!shareUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => alert("Link copied!"))
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          fallbackCopy(shareUrl);
        });
    } else {
      fallbackCopy(shareUrl);
    }
  }

  function fallbackCopy(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Link copied (fallback)!");
  }

  // If analysisData is not yet loaded, we can use placeholders.
  const summary = analysisData?.summary || "";
  const imageUrl = analysisData?.imageurl || "";
  const audioData = analysisData?.audiodata || "";
  const extractedText = analysisData?.extractedtext || "";
  const strucresponse = analysisData?.strucresponse || "{}";
  let parsedStruct = {};
  try {
    parsedStruct = JSON.parse(strucresponse);
  } catch (err) {
    console.error("Failed to parse structured response:", err);
  }

  // Hardcoded suggested questions
  const suggestedQuestions = [
    "What are the key claims?",
    "How does this compare to existing art?",
    "Any potential licensing opportunities?",
  ];

  // Basic conversation placeholder
  const conversation: Message[] = [
    {
      role: "user",
      content: persona
        ? `I am a ${persona} persona, and my question was something.`
        : "User question placeholder",
    },
    {
      role: "assistant",
      content: summary ? `Here's the summary:` : "Assistant's summary placeholder",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Top bar with share link */}
      <div className="flex items-center justify-end p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        {shareUrl && (
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Copy Share Link
          </button>
        )}
      </div>

      <div className="flex-1 grid md:grid-cols-[1fr_2fr] divide-x divide-gray-300 dark:divide-gray-700">
        {/* Left: Conversation panel */}
        <div className="p-6 overflow-y-auto">
          <ConversationPanel conversation={conversation} />
        </div>
        {/* Right: Analysis panel */}
        <div className="p-4 overflow-auto">
          <AnalysisPanel
            summary={summary}
            imageUrl={imageUrl}
            audioData={audioData}
            extractedText={extractedText}
            parsedStruct={parsedStruct}
          />
        </div>
      </div>

      {/* Bottom: Suggested questions */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
        <SuggestedQuestions
          questions={suggestedQuestions}
          onQuestionSelect={(q) => console.log("User asked:", q)}
        />
      </div>
    </div>
  );
}
