import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

export async function uploadAudioBase64(base64Audio: string): Promise<string> {
  // Remove any prefix
  const cleaned = base64Audio.replace(/^data:audio\/wav;base64,/, "");
  
  // Convert to Buffer
  const buffer = Buffer.from(cleaned, "base64");

  // Create filename
  const fileName = uuidv4() + ".wav";
  const storageZoneName = "patentvision"; // ensure lowercase as per Bunny's dashboard
  const bunnyKey = "d50f0e32-343e-4cac-b5dc27820d15-5291-48cb";
  const putUrl = `https://storage.bunnycdn.com/${storageZoneName}/audio/${fileName}`;

  try {
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

    // Return CDN URL
    return `https://PatentVision.b-cdn.net/audio/${fileName}`;
  } catch (error) {
    console.error("Error uploading to Bunny:", error);
    throw error;
  }
}
