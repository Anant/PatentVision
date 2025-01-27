// components/PatentResults/PatentSummary.tsx
import React from "react";

export function PatentSummary({ summary }: { summary: string }) {
  return (
    <div className="mt-6 mb-6">
      <h2 className="text-xl font-semibold mb-2">Summary</h2>
      <p className="border border-gray-700 bg-gray-800 p-3 rounded">
        {summary}
      </p>
    </div>
  );
}
