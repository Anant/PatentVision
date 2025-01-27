// components/PatentResults/PatentImage.tsx
import React from "react";

export function PatentImage({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
      <img
        src={imageUrl}
        alt="Generated Patent Visualization"
        className="border border-gray-700 rounded"
      />
    </div>
  );
}
