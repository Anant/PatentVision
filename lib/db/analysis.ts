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
  // "insertOne" with the columns that match your Cassandra table
  await analysisCollection.insertOne(record);
  console.log(`[storeAnalysis] Stored analysis with docId=${record.id}`);
}

export async function fetchAnalysisById(id: string) {
  try {
    // We assume the doc ID is "id"
    // If you inserted an `_id`, you'd do .findOne({_id: id}). 
    // But since your table PK is "id", do .findOne({id})
    const doc = await analysisCollection.findOne({ id });
    // doc might be undefined/null if not found
    return doc || null;
  } catch (err) {
    console.error("fetchAnalysisById error:", err);
    return null;
  }
}
