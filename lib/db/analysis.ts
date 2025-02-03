// lib/db/analysis.ts
import { db } from "./astraClient";

export interface AnalysisDoc {
  id: string;
  persona?: string;
  userquestion?: string;
  summary?: string;
  imageurl?: string;
  audiodata?: string;
  extractedtext?: string;
  strucresponse?: string;
  createdat?: string;
}

const analysisCollection = db.collection<AnalysisDoc>("analysis");

export async function storeAnalysis(record: AnalysisDoc) {
  await analysisCollection.insertOne(record);
  console.log(`[storeAnalysis] Stored analysis with docId=${record.id}`);
}

export async function fetchAnalysisById(id: string) {
  try {
    const doc = await analysisCollection.findOne({ id });
    return doc || null;
  } catch (err) {
    console.error("fetchAnalysisById error:", err);
    return null;
  }
}

// New function to fetch recent analyses (default limit = 5)
export async function fetchRecentAnalyses(limit: number = 5) {
  try {
    // For demonstration, fetch all and sort by createdat.
    // Note: This assumes createdat is stored in a sortable format (e.g. ISO 8601).
    const docs = await analysisCollection.find({}).toArray();
    const sortedDocs = docs.sort((a, b) => {
      return new Date(b.createdat || "").getTime() - new Date(a.createdat || "").getTime();
    });
    return sortedDocs.slice(0, limit);
  } catch (err) {
    console.error("fetchRecentAnalyses error:", err);
    return [];
  }
}
