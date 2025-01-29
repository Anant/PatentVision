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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Extracted PDF Text</h2>
        <button
          className="text-sm px-2 py-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded"
          onClick={() => setShowExtractedText(!showExtractedText)}
        >
          {showExtractedText ? "Hide" : "Show"}
        </button>
      </div>

      {showExtractedText && (
        <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded h-64 overflow-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}
