// components/PatentResults/PatentStructuredDetails.tsx
import React from "react";

interface PatentDetails {
  name: string;
  date: string;
  owner: string;
  viabilityScore: number;
  additionalInfo?: string;
}

export function PatentStructuredDetails({ details }: { details: PatentDetails }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Patent Details</h2>
      <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Name:</span> {details.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Date:</span> {details.date}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Owner:</span> {details.owner}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Viability Score:</span> {details.viabilityScore}/10
        </p>
        {details.additionalInfo && (
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Additional Info:</span> {details.additionalInfo}
          </p>
        )}
      </div>
    </div>
  );
}
