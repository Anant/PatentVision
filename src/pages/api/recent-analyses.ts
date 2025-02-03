// pages/api/recent-analyses.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { fetchRecentAnalyses } from "../../../lib/db/analysis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Optionally allow a query parameter to set the limit
  const limit = parseInt(req.query.limit as string) || 5;
  try {
    const recentResults = await fetchRecentAnalyses(limit);
    res.status(200).json(recentResults);
  } catch (err) {
    console.error("Error fetching recent analyses", err);
    res.status(500).json({ error: "Error fetching recent analyses" });
  }
}
