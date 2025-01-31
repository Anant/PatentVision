import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAnalysisById } from "../../../../lib/db/analysis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // e.g. GET /api/analysis/abc-123
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid id" });
  }

  const doc = await fetchAnalysisById(id);
  if (!doc) {
    return res.status(404).json({ error: "Not found" });
  }

  // Return the row
  return res.status(200).json({ analysisData: doc });
}
