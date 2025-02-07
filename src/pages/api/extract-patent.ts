// pages/api/extract-patent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Missing URL in request body" });
    }

    // 1. Launch Puppeteer (headless Chrome)
    const browser = await puppeteer.launch({
      // @ts-ignore  
      headless: "new", // or true, depending on your version
      args: ["--no-sandbox", "--disable-setuid-sandbox"], 
    });
    const page = await browser.newPage();

    // 2. Go to the patent page
    await page.goto(url, {
      waitUntil: "networkidle2",
    });

    // 3. Wait for description paragraphs
    await page.waitForSelector(".description-paragraph.style-scope.patent-text", { timeout: 10000 });

    // 4. Gather all paragraph text
    const paragraphs = await page.evaluate(() => {
      const nodes = document.querySelectorAll(".description-paragraph.style-scope.patent-text");
      return Array.from(nodes).map(el => el.textContent?.trim() || "");
    });

    // 5. Gather all image URLs in the thumbnail carousel
    //    (Adjust the selector if needed)
    const images = await page.evaluate(() => {
      const imgNodes = document.querySelectorAll(".thumbnails.style-scope.image-carousel img.style-scope.image-carousel");
      return Array.from(imgNodes).map(img => (img as HTMLImageElement).src);
    });

    await browser.close();

    // 6. Join paragraphs into a single string
    const descriptionText = paragraphs.join("\n\n");

    // Return both text + array of images
    return res.status(200).json({ descriptionText, images });
  } catch (error) {
    console.error("Error scraping patent:", error);
    return res.status(500).json({ error: "Server error extracting patent text (Puppeteer)." });
  }
}
