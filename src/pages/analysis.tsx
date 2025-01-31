import React, { useState } from "react";
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
  const {
    analysisId,
    summary = "",
    imageUrl = "",
    audioData = "",
    extractedText = "",
    persona = "",
    // We'll parse strucresponse if present
    strucresponse = "{}",
  } = router.query;

  // Check if we're running in the browser (window is defined)
  const isBrowser = typeof window !== "undefined";

  // Build shareUrl if analysisId is present and we have a window.location
  const shareUrl =
    isBrowser && analysisId
      ? `${window.location.origin}/analysis/${analysisId}`
      : null;

  // Clipboard copy logic
  function handleCopy() {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
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

  function fallbackCopy(str: string) {
    const textArea = document.createElement("textarea");
    textArea.value = str;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Link copied (fallback)!");
  }

  // Convert query params to guaranteed strings
  const summaryStr = Array.isArray(summary) ? summary[0] : summary;
  const imageUrlStr = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  const audioDataStr = Array.isArray(audioData) ? audioData[0] : audioData;
  const extractedTextStr = Array.isArray(extractedText)
    ? extractedText[0]
    : extractedText;
  const personaStr = Array.isArray(persona) ? persona[0] : persona;
  const strucresponseStr = Array.isArray(strucresponse)
    ? strucresponse[0]
    : strucresponse;

  // Parse the structured response if it exists
  let parsedStruct: any = {};
  try {
    parsedStruct = JSON.parse(strucresponseStr);
  } catch (err) {
    console.error("Failed to parse structured response JSON", err);
  }

  // Hardcoded suggestions
  const suggestedQuestions = [
    "What are the key claims?",
    "How does this compare to existing art?",
    "Any potential licensing opportunities?",
  ];

  // Basic conversation to display in the left column
  const conversation: Message[] = [
    {
      role: "user",
      content: personaStr
        ? `I am a ${personaStr} persona, and my question was something.`
        : "User question placeholder",
    },
    {
      role: "assistant",
      content: summaryStr ? `Here's the summary:` : "Assistant's summary placeholder",
    },
  ];

  function askQuestion(question: string) {
    console.log("User asked a follow-up question:", question);
    // Potentially do another fetch or update conversation state
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Top bar with copy link (if shareUrl is defined) */}
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
        {/* Left: conversation area */}
        <div className="p-6 overflow-y-auto">
          <ConversationPanel conversation={conversation} />
        </div>

        {/* Right: analysis area */}
        <div className="p-4 overflow-auto">
          <AnalysisPanel
            summary={summaryStr}
            imageUrl={imageUrlStr}
            audioData={audioDataStr}
            extractedText={extractedTextStr}
            parsedStruct={parsedStruct}
          />
        </div>
      </div>

      {/* Bottom area: suggested questions + new input */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
        <SuggestedQuestions questions={suggestedQuestions} onQuestionSelect={askQuestion} />
        {/* If you want an EnhancedInput for follow-up Q's, you can place it here */}
      </div>
    </div>
  );
}
