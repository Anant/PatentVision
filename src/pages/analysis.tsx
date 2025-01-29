import React, { useState } from "react";
import { useRouter } from "next/router";

// Reuse your existing patent result components
import { PatentSummary } from "@/components/PatentResults/PatentSummary";
import { PatentImage } from "@/components/PatentResults/PatentImage";
import { PatentAudio } from "@/components/PatentResults/PatentAudio";
import { PatentStructuredDetails } from "@/components/PatentResults/PatentStructuredDetails";
import { ExtractedPdfText } from "@/components/PatentResults/ExtractedPdfText";
import ThemeToggle from "@/components/ThemeToggle";

export default function Analysis() {
  const router = useRouter();
  const {
    summary = "",
    imageUrl = "",
    audioData = "",
    extractedText = "",
    persona = "",
    // We'll parse strucresponse if present
    strucresponse = "{}",
  } = router.query;

  // Parse the structured response if it exists
  let parsedStruct: any = {};
  try {
    parsedStruct = JSON.parse(strucresponse as string);
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
  const conversation = [
    {
      role: "user",
      content: persona
        ? `I am a ${persona} persona, and my question was something.`
        : "User question placeholder",
    },
    {
      role: "assistant",
      content: summary
        ? `Here's the summary:`
        : "Assistant's summary placeholder",
    },
  ];

  // We can reuse the ExtractedPdfText component if we define local state for `showExtractedText`.
  // By default, let's keep it collapsed.
  const [showExtractedText, setShowExtractedText] = useState(false);

  // If you'd like to handle follow-up questions, implement askQuestion.
  function askQuestion(question: string) {
    console.log("User asked a follow-up question:", question);
    // Potentially do another fetch or local state update.
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Main area: left side is conversation, right side is analysis data */}
      <div className="flex-1 grid md:grid-cols-[1fr_2fr] divide-x divide-gray-300 dark:divide-gray-700">
        {/* Left: conversation area */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div>
                  <p className="font-bold">
                    {msg.role === "user"
                      ? "User"
                      : msg.role === "assistant"
                      ? "Assistant"
                      : "System"}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2">
                      <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        👍 Helpful
                      </button>
                      <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        👎 Not helpful
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: analysis data */}
        <div className="p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patent details card */}
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
              <h2 className="text-lg font-semibold mb-4">Patent Details</h2>

              {/* 1) Show the summary using your PatentSummary component */}
              {summary && <PatentSummary summary={summary as string} />}

              {/* 2) Show structured details (if you want it here) */}
              {parsedStruct && <PatentStructuredDetails details={parsedStruct} />}

              {/* 3) Show extracted PDF text, collapsed by default */}
              {extractedText && (
                <ExtractedPdfText
                  extractedText={extractedText as string}
                  showExtractedText={showExtractedText}
                  setShowExtractedText={setShowExtractedText}
                />
              )}
            </div>

            <div className="space-y-4">
              {/* Patent Visualization */}
              <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
                <h3 className="text-md font-semibold mb-2">Patent Visualization</h3>
                {imageUrl ? (
                  <PatentImage imageUrl={imageUrl as string} />
                ) : (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                    <span className="text-gray-500 dark:text-gray-300">Patent Image Placeholder</span>
                  </div>
                )}
              </div>

              {/* Video Explanation (placeholder) */}
              <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
                <h3 className="text-md font-semibold mb-2">Video Explanation</h3>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                  <span className="text-gray-500 dark:text-gray-300">Video Player Placeholder</span>
                </div>
              </div>

              {/* Audio Analysis */}
              <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
                <h3 className="text-md font-semibold mb-2">Audio Analysis</h3>
                {audioData ? (
                  <PatentAudio audioData={audioData as string} />
                ) : (
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                    <span className="text-gray-500 dark:text-gray-300">Audio Player Placeholder</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom area: suggested questions + new input */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
              onClick={() => askQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>

        {/* If you want a new EnhancedInput for follow-up Q's: 
            <EnhancedInput onAskQuestion={askQuestion} />
        */}
      </div>
    </div>
  );
}
