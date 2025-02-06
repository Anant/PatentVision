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
      //@ts-ignore  
      headless: "new", // or true, depending on your version
      args: ["--no-sandbox", "--disable-setuid-sandbox"], 
    });
    const page = await browser.newPage();

    // 2. Go to the patent page
    await page.goto(url, {
      waitUntil: "networkidle2", 
      // "networkidle2" helps ensure major network requests (like dynamic data) are done
    });

    // 3. Wait for .description-paragraph or some container that ensures content is loaded
    await page.waitForSelector(".description-paragraph.style-scope.patent-text", { timeout: 10000 });

    // 4. Evaluate in the browser context to gather text from all .description-paragraph elements
    const paragraphs = await page.evaluate(() => {
      const nodes = document.querySelectorAll(".description-paragraph.style-scope.patent-text");
      return Array.from(nodes).map(el => el.textContent?.trim() || "");
    });

    await browser.close();

    // 5. Join them into a single string
    const descriptionText = paragraphs.join("\n\n");
    return res.status(200).json({ descriptionText });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error extracting patent text (Puppeteer)." });
  }
}
