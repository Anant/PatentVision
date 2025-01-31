import { db } from "./astraClient";

/** 
 * If you want strong typing, define an interface for your row shape.
 * This interface must contain an `_id` or something you define as the doc ID
 * if you want to rely on the Document API default ID behavior.
 *
 * However, for a table with primary key 'id', you can store it as a column.
 * We'll define 'AnalysisDoc' with an optional `_id` just for demonstration.
 */
export interface AnalysisDoc {
  //_id?: string;          // the document ID used by the collection
  id: string;            // your primary key column
  persona?: string;
  userQuestion?: string;
  summary?: string;
  imageUrl?: string;
  audioData?: string;
  extractedText?: string;
  strucresponse?: string;
  createdAt?: string;
}

/**
 * Create or reference the 'analysis' collection (which points to 
 * the existing table in Cassandra).
 */
const analysisCollection = db.collection<AnalysisDoc>("analysis");

/**
 * Store the AI-generated analysis record by 'id' as the doc ID.
 * We'll also set `_id = record.id` so the Document API sees that as the doc ID.
 */
export async function storeAnalysis(record: AnalysisDoc) {
  // The doc ID used by the Document API:
  // If your table's primary key is "id text", we can store doc with docId = record.id.
  // We also set `_id = record.id` in the doc itself for clarity.
  

  // 'insertOne' or 'upsertOne' can be used. 
  // If you'd rather do an upsert, use collection.replaceOne(...) or .updateOne(...).
  await analysisCollection.insertOne(record);
  console.log(`[storeAnalysis] Stored analysis with docId=${record.id}`);
}

/**
 * Fetch an analysis row by 'id' (the doc ID).
 */
export async function fetchAnalysisById(id: string) {
  try {
    // The Document API docId is your 'id'.
    // .findOne({ _id: id }) tells the doc API to find a doc whose _id = id
    // If your row stored `_id = record.id` as above, this will match the row.
    const doc = await analysisCollection.findOne({ _id: id });
    return doc; // doc is an AnalysisDoc or null if not found
  } catch (err: any) {
    console.error("fetchAnalysisById error:", err);
    return null;
  }
}
