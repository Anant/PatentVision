// pages/api/image-proxy/[filename].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    return res.status(400).send("Missing filename");
  }

  // Define your storage zone and construct the Bunny URL for images.
  const storageZone = "patentvision"; // your storage zone name
  const bunnyUrl = `https://storage.bunnycdn.com/${storageZone}/images/${filename}`;

  // Use your read-only AccessKey for Bunny
  const bunnyReadKey = "b736f749-af08-47c4-b1ab1bde8287-0486-4392"; // example

  try {
    // Fetch the image from Bunny using the read key
    const bunnyResponse = await fetch(bunnyUrl, {
      headers: {
        "AccessKey": bunnyReadKey,
      },
    });

    if (!bunnyResponse.ok) {
      // Forward any error status from Bunny
      return res.status(bunnyResponse.status).send(`Error: ${bunnyResponse.statusText}`);
    }

    // Option A: Buffer the entire file
    const arrayBuffer = await bunnyResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set the appropriate headers. Adjust the Content-Type if your images might be JPEG, etc.
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", buffer.length.toString());

    // Send the buffered image
    return res.status(200).send(buffer);

    // Option B (streaming) is available if needed.
  } catch (err) {
    console.error("Error proxying Bunny image:", err);
    return res.status(500).send("Server error");
  }
}
