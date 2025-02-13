import React, { useState } from "react";

interface PatentImageProps {
  imageUrl: string;
  hideTitle?: boolean;
  containerClassName?: string; // optional override for the outer container
  imageClassName?: string;     // optional override for the img element
}

export function PatentImage({
  imageUrl,
  hideTitle,
  containerClassName,
  imageClassName,
}: PatentImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl) return null;

  // Directly use the provided DigitalOcean Spaces URL.
  const finalImageUrl = imageUrl;

  // Use defaults if no custom classes are provided:
  const containerClasses = containerClassName || "h-64 w-full";
  const imgClasses =
    imageClassName ||
    "border border-gray-700 rounded transition-opacity duration-300 h-full w-full object-cover";

  return (
    <div className="mb-6">
      {!hideTitle && (
        <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
      )}
      <div className={`relative ${containerClasses}`}>
        {isLoading && (
          <div className="animate-pulse bg-gray-300 rounded border border-gray-700 h-full w-full" />
        )}
        <img
          src={finalImageUrl}
          alt="Generated Patent Visualization"
          className={`${imgClasses} ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
