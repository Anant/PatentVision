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
      <h2 className="text-xl font-semibold mb-2">Patent Details</h2>
      <div className="border border-gray-700 bg-gray-800 p-4 rounded">
        <p>
          <span className="font-semibold">Name:</span> {details.name}
        </p>
        <p>
          <span className="font-semibold">Date:</span> {details.date}
        </p>
        <p>
          <span className="font-semibold">Owner:</span> {details.owner}
        </p>
        <p>
          <span className="font-semibold">Viability Score:</span> {details.viabilityScore}/10
        </p>
        {details.additionalInfo && (
          <p>
            <span className="font-semibold">Additional Info:</span> {details.additionalInfo}
          </p>
        )}
      </div>
    </div>
  );
}
