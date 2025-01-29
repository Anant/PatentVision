import React, { useState } from "react";
import { PatentSummary } from "@/components/PatentResults/PatentSummary";
import { PatentImage } from "@/components/PatentResults/PatentImage";
import { PatentAudio } from "@/components/PatentResults/PatentAudio";
import { PatentStructuredDetails } from "@/components/PatentResults/PatentStructuredDetails";
import { ExtractedPdfText } from "@/components/PatentResults/ExtractedPdfText";

interface AnalysisPanelProps {
  summary?: string;
  imageUrl?: string;
  audioData?: string;
  extractedText?: string;
  parsedStruct?: any; // Replace 'any' with a more specific type if available
}

export function AnalysisPanel({
  summary,
  imageUrl,
  audioData,
  extractedText,
  parsedStruct,
}: AnalysisPanelProps) {
  // Reuse the local state for toggling PDF text
  const [showExtractedText, setShowExtractedText] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Patent details card */}
      <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Patent Details</h2>

        {/* 1) Show the summary */}
        {summary && <PatentSummary summary={summary} />}

        {/* 2) Show structured details (parsed struct) */}
        {parsedStruct && <PatentStructuredDetails details={parsedStruct} />}

        {/* 3) Show extracted PDF text, collapsed by default */}
        {extractedText && (
          <ExtractedPdfText
            extractedText={extractedText}
            showExtractedText={showExtractedText}
            setShowExtractedText={setShowExtractedText}
          />
        )}
      </div>

      <div className="space-y-4">
        {/* Patent Visualization */}
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
          <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Patent Visualization</h3>
          {imageUrl ? (
            <PatentImage imageUrl={imageUrl} />
          ) : (
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
              <span className="text-gray-500 dark:text-gray-300">Patent Image Placeholder</span>
            </div>
          )}
        </div>

        {/* Video Explanation (placeholder) */}
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
          <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Video Explanation</h3>
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
            <span className="text-gray-500 dark:text-gray-300">Video Player Placeholder</span>
          </div>
        </div>

        {/* Audio Analysis */}
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
          <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Audio Analysis</h3>
          {audioData ? (
            <PatentAudio audioData={audioData} />
          ) : (
            <div className="h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
              <span className="text-gray-500 dark:text-gray-300">Audio Player Placeholder</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
