// components/PatentResults/ExtractedPdfText.tsx
import React from "react";

export function ExtractedPdfText({
  extractedText,
  showExtractedText,
  setShowExtractedText,
}: {
  extractedText: string;
  showExtractedText: boolean;
  setShowExtractedText: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Extracted PDF Text</h2>
        <button
          className="text-sm px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setShowExtractedText(!showExtractedText)}
        >
          {showExtractedText ? "Hide" : "Show"}
        </button>
      </div>

      {showExtractedText && (
        <div className="border border-gray-700 bg-gray-800 p-3 rounded h-64 overflow-auto">
          <pre className="whitespace-pre-wrap text-sm">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}
