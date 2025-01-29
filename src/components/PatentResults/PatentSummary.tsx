// components/PatentResults/PatentSummary.tsx
import React from "react";
import ReactMarkdown from "react-markdown";

export function PatentSummary({ summary }: { summary: string }) {
  return (
    <div className="mt-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Summary</h2>
      <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded">
        <ReactMarkdown className="prose dark:prose-invert">{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
