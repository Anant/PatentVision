// pages/api/audio-proxy/[filename].ts

import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

/**
 * GET /api/audio-proxy/<filename>
 * Example: /api/audio-proxy/abc-123.wav
 *
 * The browser calls this route, and the server fetches
 * the audio from Bunny using the read-only AccessKey.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Grab filename from URL param
  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    return res.status(400).send("Missing filename");
  }

  // 2) Build the Bunny storage URL
  //    e.g. "https://storage.bunnycdn.com/patentvision/audio/filename.wav"
  const storageZone = "patentvision"; // your storage zone name
  const bunnyUrl = `https://storage.bunnycdn.com/${storageZone}/audio/${filename}`;

  // 3) Use your read-only AccessKey
  const bunnyReadKey = "b736f749-af08-47c4-b1ab1bde8287-0486-4392"; // example

  try {
    // 4) Fetch from Bunny using server side code
    const bunnyResponse = await fetch(bunnyUrl, {
      headers: {
        "AccessKey": bunnyReadKey,
      },
    });

    if (!bunnyResponse.ok) {
      // forward error
      return res.status(bunnyResponse.status).send(`Error: ${bunnyResponse.statusText}`);
    }

    // 5) Pipe or buffer the response
    // Option A: buffer the entire file (simpler, but no partial range support):
    const arrayBuffer = await bunnyResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6) Set appropriate headers
    // e.g. "Content-Type: audio/wav" or "audio/mpeg" if needed
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", buffer.length.toString());

    // 7) Send the file data
    return res.status(200).send(buffer);

    // OR, if you want streaming approach:
    // res.setHeader("Content-Type", "audio/wav");
    // bunnyResponse.body.pipe(res);

  } catch (err) {
    console.error("Error proxying Bunny audio:", err);
    return res.status(500).send("Server error");
  }
}
