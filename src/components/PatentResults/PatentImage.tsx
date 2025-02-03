// components/PatentResults/PatentImage.tsx
import React, { useState } from "react";

export function PatentImage({
  imageUrl,
  hideTitle,
}: {
  imageUrl: string;
  hideTitle?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl) {
    return null;
  }

  let finalImageUrl = imageUrl;

  try {
    const urlObj = new URL(imageUrl);
    // If the image is from your Bunny CDN, use your proxy
    if (urlObj.hostname.includes("patentvision.b-cdn.net")) {
      const fileName = urlObj.pathname.split("/").pop() || "";
      if (!fileName) {
        return <p>Invalid image link</p>;
      }
      finalImageUrl = `/api/image-proxy/${fileName}`;
    }
    // Otherwise, use the direct URL (e.g. from Azure Blob storage)
  } catch (err) {
    console.error("Invalid imageUrl:", imageUrl, err);
  }

  return (
    <div className="mb-6">
      {!hideTitle && (
        <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
      )}
      {/* Container with fixed height and width set to h-64 */}
      <div className="relative h-64 w-full">
        {isLoading && (
          // Skeleton placeholder uses full container dimensions
          <div className="animate-pulse bg-gray-300 rounded border border-gray-700 h-full w-full" />
        )}
        <img
          src={finalImageUrl}
          alt="Generated Patent Visualization"
          className={`border border-gray-700 rounded transition-opacity duration-300 h-64 w-full object-cover ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
