import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

/**
 * Given an externalImageUrl (e.g. from DALL·E),
 * 1) fetch the image data
 * 2) upload it to DigitalOcean Spaces using the given analysisId
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

  // 2. Guess file extension
  const fileExtension = guessFileExtensionFromUrl(externalImageUrl) || "png";
  const fileName = `${analysisId}.${fileExtension}`;
  const Key = `images/${fileName}`;

  // 3. Create S3 client for DigitalOcean Spaces
  const s3 = new S3Client({
    region: "nyc3",
    endpoint: "https://nyc3.digitaloceanspaces.com",
    credentials: {
      accessKeyId: "DO801ZQ8T3MGYDB2JG9R",
      secretAccessKey: "fvnWJN8Uo5s3P6ZuNPF9e2pxXSBITnKMMrkrWkHhvwc",
    },
  });

  // 4. Upload image to DO Spaces
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: "patent.vision.podcast.cdn",
        Key,
        Body: buffer,
        ContentType: `image/${fileExtension}`,
        ACL: "public-read",
      })
    );
  } catch (err) {
    throw new Error(`DigitalOcean Spaces image upload failed: ${err}`);
  }

  // 5. Return the CDN URL
  return `https://patent.vision.podcast.cdn.nyc3.digitaloceanspaces.com/${Key}`;
}

/**
 * Attempt to guess a file extension from the image URL.
 * If none is found, default to "png".
 */
function guessFileExtensionFromUrl(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  return null;
}
