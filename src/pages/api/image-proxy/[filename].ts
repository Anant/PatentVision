import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    return res.status(400).send("Missing filename");
  }

  // Construct the DigitalOcean Spaces URL for the image
  // Bucket name + region + digitaloceanspaces.com
  // + your subfolder, if any (e.g., /images/).
  const doUrl = `https://patent-vision-podcast-cdn.nyc3.digitaloceanspaces.com/images/${filename}`;

  try {
    // If your Space is public, this simple fetch will work
    const doResponse = await fetch(doUrl);

    if (!doResponse.ok) {
      // Forward any error status
      return res.status(doResponse.status).send(`Error: ${doResponse.statusText}`);
    }

    // Buffer the entire file
    const arrayBuffer = await doResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For demonstration, we assume PNG. If you store multiple formats, 
    // you’ll need to detect the actual Content-Type, or set up custom logic.
    // Or see if the doResponse headers have the Content-Type:
    const contentType = doResponse.headers.get("content-type") || "image/png";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length.toString());

    // Send the buffered image
    return res.status(200).send(buffer);

  } catch (err) {
    console.error("Error proxying image from DO Spaces:", err);
    return res.status(500).send("Server error");
  }
}
