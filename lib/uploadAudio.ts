import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Upload base64 WAV data to DigitalOcean Spaces using the given analysisId as filename
 */
export async function uploadAudioBase64(base64Audio: string, analysisId: string): Promise<string> {
  console.log(`Starting audio upload for analysisId: ${analysisId}`);

  // 1. Remove data URL prefix
  const cleaned = base64Audio.replace(/^data:audio\/wav;base64,/, "");
  console.log(`Cleaned base64 string length: ${cleaned.length}`);

  // 2. Convert base64 -> buffer
  const buffer = Buffer.from(cleaned, "base64");
  console.log(`Buffer created with length: ${buffer.length}`);

  // 3. Construct the object key
  const fileName = `${analysisId}.wav`;
  const Key = `audio-short/${fileName}`;
  console.log(`FileName: ${fileName}, Key: ${Key}`);

  // 4. Create an S3 client configured for DigitalOcean Spaces with forcePathStyle enabled
  const s3 = new S3Client({
    region: "nyc3",
    endpoint: "https://nyc3.digitaloceanspaces.com", // DO Spaces endpoint
    forcePathStyle: true, // Force path-style URLs to avoid issues with dots in bucket names
    credentials: {
      accessKeyId: "DO801ZQ8T3MGYDB2JG9R",
      secretAccessKey: "fvnWJN8Uo5s3P6ZuNPF9e2pxXSBITnKMMrkrWkHhvwc",
    },
  });

  // 5. Upload to your bucket
  try {
    console.log("Sending PutObjectCommand to DigitalOcean Spaces...");
    await s3.send(
      new PutObjectCommand({
        Bucket: "patent.vision.podcast.cdn", // Your bucket name
        Key,
        Body: buffer,
        ContentType: "audio/wav",
        ACL: "public-read", // Enable public read if you want the URL to be publicly accessible
      })
    );
    console.log("Upload successful.");
  } catch (err) {
    console.error("DigitalOcean Spaces audio upload failed:", err);
    throw new Error(`DigitalOcean Spaces audio upload failed: ${err}`);
  }

  // 6. Return a publicly accessible URL (assuming ACL: 'public-read')
  const publicUrl = `https://patent.vision.podcast.cdn.nyc3.digitaloceanspaces.com/${Key}`;
  console.log(`Returning public URL: ${publicUrl}`);
  return publicUrl;
}
