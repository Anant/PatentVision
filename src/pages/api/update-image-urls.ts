import type { NextApiRequest, NextApiResponse } from "next";
import { getAllAnalyses, updateAnalysis } from "../../../lib/db/analysis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all analysis records.
    const analyses = await getAllAnalyses();

    // Loop over records and update the imageurl if it contains the old domain.
    for (const analysis of analyses) {
      if (
        analysis.imageurl &&
        analysis.imageurl.includes("https://PatentVision.b-cdn.net/images/")
      ) {
        // Replace the old domain with the new one.
        const newImageUrl = analysis.imageurl.replace(
          "https://PatentVision.b-cdn.net/images/",
          "https://patent.vision.podcast.cdn.nyc3.digitaloceanspaces.com/images/"
        );
        await updateAnalysis(analysis.id, { imageurl: newImageUrl });
        console.log(`Updated record ${analysis.id} to ${newImageUrl}`);
      }
    }

    return res.status(200).json({ message: "Image URLs updated successfully." });
  } catch (err) {
    console.error("Error updating image URLs:", err);
    return res.status(500).json({ error: "Failed to update image URLs." });
  }
}
