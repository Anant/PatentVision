// pages/api/analysis-status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAnalysisById } from "../../../lib/db/analysis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { analysisId } = req.query;
  if (!analysisId || typeof analysisId !== "string") {
    return res.status(400).json({ error: "Missing or invalid analysisId" });
  }
  try {
    const analysis = await fetchAnalysisById(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    return res.status(200).json(analysis);
  } catch (err) {
    console.error("Error fetching analysis status:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
