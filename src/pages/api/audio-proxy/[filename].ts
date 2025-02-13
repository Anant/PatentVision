import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

/**
 * GET /api/audio-proxy/<filename>
 * Example: /api/audio-proxy/abc-123.wav
 *
 * The browser calls this route, and the server fetches
 * the audio from DigitalOcean Spaces. We assume it's public.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Grab the filename from URL param
  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    return res.status(400).send("Missing filename");
  }

  // 2) Build the DO Spaces URL:
  //    e.g. "https://<bucket>.<region>.digitaloceanspaces.com/audio-short/filename.wav"
  //    Adjust if your folder name or bucket is different
  const doUrl = `https://patent.vision.podcast.cdn.nyc3.digitaloceanspaces.com/audio-short/${filename}`;

  try {
    // 3) Fetch from DO Spaces
    //    If it's public, no extra headers or auth are needed
    const doResponse = await fetch(doUrl);
    if (!doResponse.ok) {
      return res.status(doResponse.status).send(`Error: ${doResponse.statusText}`);
    }

    // 4) Buffer the entire file (no partial range support in this example)
    const arrayBuffer = await doResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5) Set headers
    // Adjust Content-Type if you sometimes store MP3, etc.
    const contentType = doResponse.headers.get("content-type") || "audio/wav";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length.toString());

    // 6) Send the file data
    return res.status(200).send(buffer);

    // If you want streaming for large files or partial-range support,
    // you could pipe doResponse.body directly to res, but that requires
    // some extra adjustments to handle range requests, etc.

  } catch (err) {
    console.error("Error proxying DO audio:", err);
    return res.status(500).send("Server error");
  }
}
