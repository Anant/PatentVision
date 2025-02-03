// components/RecentAnalysisCard.tsx
import React from "react";
import Link from "next/link";
import { PatentImage } from "./PatentResults/PatentImage";

export function RecentAnalysisCard({ analysis }: { analysis: any }) {
  const { id, imageurl, strucresponse } = analysis;

  // Extract the title from the strucresponse JSON.
  let title = "Untitled";
  if (strucresponse) {
    try {
      const responseObj =
        typeof strucresponse === "string" ? JSON.parse(strucresponse) : strucresponse;
      title = responseObj.name || title;
    } catch (err) {
      console.error("Error parsing strucresponse:", err);
    }
  }

  return (
    <Link href={`/analysis/${id}`}>
      <div className="border p-4 rounded hover:shadow-lg transition cursor-pointer">
        {/* Use PatentImage with hideTitle so that only the image is rendered */}
        <PatentImage imageUrl={imageurl} hideTitle={true} />
        <h3 className="mt-2 text-lg font-bold">{title}</h3>
      </div>
    </Link>
  );
}
