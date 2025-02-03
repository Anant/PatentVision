// components/Analysis/AnalysisPanel.tsx
import React, { useState } from "react";
import { PatentSummary } from "@/components/PatentResults/PatentSummary";
import { PatentImage } from "@/components/PatentResults/PatentImage";
import { PatentAudio } from "@/components/PatentResults/PatentAudio";
import { PatentStructuredDetails } from "@/components/PatentResults/PatentStructuredDetails";
import { ExtractedPdfText } from "@/components/PatentResults/ExtractedPdfText";
import { SkeletonBlock } from "../ui/SkeletonBlock";

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
  const [showExtractedText, setShowExtractedText] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Patent details card */}
      <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Patent Details
        </h2>

        {/* 1) Summary */}
        {summary ? (
          <PatentSummary summary={summary} />
        ) : (
          <SkeletonBlock className="h-6 w-3/4 mb-2" />
        )}

        {/* 2) Structured details */}
        {parsedStruct && Object.keys(parsedStruct).length > 0 ? (
          <PatentStructuredDetails details={parsedStruct} />
        ) : (
          <SkeletonBlock className="h-6 w-1/2 mb-2" />
        )}

        {/* 3) Extracted PDF text (show/hide) */}
        {extractedText ? (
          <ExtractedPdfText
            extractedText={extractedText}
            showExtractedText={showExtractedText}
            setShowExtractedText={setShowExtractedText}
          />
        ) : (
          <SkeletonBlock className="h-6 w-full" />
        )}
      </div>

      <div className="space-y-4">
        {/* Patent Visualization */}
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
          <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Patent Visualization
          </h3>
          {imageUrl ? (
            <PatentImage
              imageUrl={imageUrl}
              containerClassName="w-full"
              imageClassName="border border-gray-700 rounded transition-opacity duration-300 w-full object-contain"
            />
          ) : (
            /* Instead of a static placeholder, we can add a skeleton block with a fixed height. */
            <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded overflow-hidden">
              <SkeletonBlock className="absolute inset-0 w-full h-full" />
              <span className="text-gray-500 dark:text-gray-300 z-10">
                Loading image...
              </span>
            </div>
          )}
        </div>

        {/* Audio Analysis */}
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
          <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Audio Analysis
          </h3>
          {audioData ? (
            <PatentAudio audioData={audioData} />
          ) : (
            <div className="relative h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded overflow-hidden">
              <SkeletonBlock className="absolute inset-0 w-full h-full" />
              <span className="text-gray-500 dark:text-gray-300 z-10">
                Generating audio...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
