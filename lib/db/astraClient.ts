// lib/db/astraClient.ts

import { DataAPIClient } from "@datastax/astra-db-ts";

/**
 * We assume you have environment variables:
 * - ASTRA_DB_APPLICATION_TOKEN: your Astra token
 * - ASTRA_DB_URL: your Astra database base URL
 * - ASTRA_DB_KEYSPACE: the keyspace name
 */
const token = process.env.ASTRA_DB_APPLICATION_TOKEN!;
const baseUrl = process.env.ASTRA_DB_URL!;
const keyspace = process.env.ASTRA_DB_KEYSPACE!;

/**
 * Create the DataAPIClient by passing the token as the first argument
 * (if you prefer) or no arguments if you want to supply the token later.
 *
 * The second param used to accept 'logging' in older versions but not anymore.
 */
const client = new DataAPIClient(token);

/**
 * Create a DB reference with the correct URL, token, and keyspace ("namespace").
 */
export const db = client.db(baseUrl, {
  token,
  namespace: keyspace,
});

/**
 * Optional: Quick test to confirm connectivity by listing collections (tables).
 */
export async function testConnection() {
  const collections = await db.listCollections();
  console.log("AstraDB connected, found collections:", collections);
}
