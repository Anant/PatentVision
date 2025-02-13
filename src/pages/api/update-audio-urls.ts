import type { NextApiRequest, NextApiResponse } from "next";
import { getAllAnalyses, updateAnalysis } from "../../../lib/db/analysis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all analysis records
    const analyses = await getAllAnalyses();

    // Loop over records and update the audiodata URL if needed
    for (const analysis of analyses) {
      if (
        analysis.audiodata &&
        analysis.audiodata.includes("https://PatentVision.b-cdn.net/audio/")
      ) {
        const newAudioUrl = analysis.audiodata.replace(
          "https://PatentVision.b-cdn.net/audio/",
          "https://patent.vision.podcast.cdn.nyc3.digitaloceanspaces.com/audio-short/"
        );
        await updateAnalysis(analysis.id, { audiodata: newAudioUrl });
        console.log(`Updated record ${analysis.id} to ${newAudioUrl}`);
      }
    }

    return res.status(200).json({ message: "Audio URLs updated successfully." });
  } catch (err) {
    console.error("Error updating audio URLs:", err);
    return res.status(500).json({ error: "Failed to update audio URLs." });
  }
}
