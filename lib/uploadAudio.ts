// lib/uploadAudio.ts
import fetch from "node-fetch";

/**
 * Upload base64 WAV data to Bunny using the given analysisId as filename
 */
export async function uploadAudioBase64(base64Audio: string, analysisId: string): Promise<string> {
  // 1. Remove prefix
  const cleaned = base64Audio.replace(/^data:audio\/wav;base64,/, "");

  // 2. Convert base64 -> buffer
  const buffer = Buffer.from(cleaned, "base64");

  // 3. fileName = <analysisId>.wav
  const fileName = `${analysisId}.wav`;

  // 4. Bunny info
  const storageZoneName = "patentvision"; 
  const bunnyKey = "d50f0e32-343e-4cac-b5dc27820d15-5291-48cb"; 
  const putUrl = `https://storage.bunnycdn.com/${storageZoneName}/audio/${fileName}`;

  // 5. Upload
  const resp = await fetch(putUrl, {
    method: "PUT",
    headers: {
      "AccessKey": bunnyKey,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`Bunny upload failed: ${resp.status} ${msg}`);
  }

  // 6. Return the CDN URL
  return `https://PatentVision.b-cdn.net/audio/${fileName}`;
}
