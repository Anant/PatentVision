// lib/uploadImage.ts
import fetch from "node-fetch";

/**
 * Given an externalImageUrl (like from DALL·E), 
 * 1) fetch the image data
 * 2) upload it to Bunny Storage using the given analysisId
 * 3) return the stable CDN link
 */
export async function uploadImageFromUrl(
  externalImageUrl: string,
  analysisId: string
): Promise<string> {
  // 1. Download the image from the external URL
  const response = await fetch(externalImageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 2. Build Bunny upload URL
  //    We'll store under /images/<analysisId>.png (or .jpg, depends on your AI)
  const fileExtension = guessFileExtensionFromUrl(externalImageUrl) || "png";
  const fileName = `${analysisId}.${fileExtension}`;
  const storageZone = "patentvision"; // storage zone
  const bunnyKey = "d50f0e32-343e-4cac-b5dc27820d15-5291-48cb";
  const putUrl = `https://storage.bunnycdn.com/${storageZone}/images/${fileName}`;

  // 3. Upload to Bunny
  const bunnyResp = await fetch(putUrl, {
    method: "PUT",
    headers: {
      AccessKey: bunnyKey,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });
  if (!bunnyResp.ok) {
    const msg = await bunnyResp.text();
    throw new Error(`Bunny image upload failed: ${bunnyResp.status} ${msg}`);
  }

  // 4. Return the CDN URL
  return `https://PatentVision.b-cdn.net/images/${fileName}`;
}

/**
 * (Optional) Attempt to guess a file extension from the AI’s image URL.
 * Many DALL·E links end with .png or .jpg. If not, fallback to "png".
 */
function guessFileExtensionFromUrl(url: string): string | null {
  // naive approach
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  // fallback
  return null;
}
