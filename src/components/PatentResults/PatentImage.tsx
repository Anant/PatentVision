// components/PatentResults/PatentImage.tsx
import React from "react";

export function PatentImage({ imageUrl, hideTitle }: { imageUrl: string; hideTitle?: boolean }) {
  if (!imageUrl) {
    return null;
  }

  let fileName = "";
  try {
    const urlObj = new URL(imageUrl);
    fileName = urlObj.pathname.split("/").pop() || "";
  } catch (err) {
    console.error("Invalid imageUrl:", imageUrl, err);
  }

  if (!fileName) {
    return <p>Invalid image link</p>;
  }

  // Build the proxied URL so that Bunny's read key is used
  const proxiedImageUrl = `/api/image-proxy/${fileName}`;

  return (
    <div className="mb-6">
      {!hideTitle && (
        <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
      )}
      <img
        src={proxiedImageUrl}
        alt="Generated Patent Visualization"
        className="border border-gray-700 rounded"
      />
    </div>
  );
}
