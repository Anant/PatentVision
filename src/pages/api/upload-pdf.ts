// pages/api/upload-pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import formidable from "formidable";
import fs from "fs";
//@ts-ignore
import pdfParse from "pdf-parse";
import OpenAI from "openai";

// Tell Next.js not to parse the request body (we'll do it with formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ensure this is in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Parse the incoming form data with formidable
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      // Limit size to ~10 MB
      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      //@ts-ignore
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // 2. Check for our file => "file"
    const uploadedFile = files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // If "file" can be an array (multiple files), handle that:
    const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
    const filePath = fileObj.filepath;

    // 3. Read the file as a buffer and parse the PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text?.trim() || "";

    if (!extractedText) {
      return res.status(400).json({ error: "Failed to extract text from PDF." });
    }

    // 4. Summarize the text using GPT-4
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI that summarizes patent text.",
        },
        {
          role: "user",
          content: `Summarize the following patent text in a concise way:\n\n${extractedText}`,
        },
      ],
    });

    const summary = chatResponse.choices[0]?.message?.content || "";

    // 5. Generate an image with DALL·E 3
    let imageUrl = "";
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Generate an image representing the following concept: ${summary}`,
        n: 1,
        size: "1024x1024",
      });
      imageUrl = imageResponse.data[0]?.url || "";
    } catch (error) {
      console.error("Error generating image:", error);
    }

    // 6. (Optional) Generate audio
    let audioDataBase64 = "";
    try {
      const audioResponse = await openai.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: "alloy", format: "wav" },
        messages: [
          {
            role: "system",
            content: "You are a helpful AI that produces spoken patent summaries.",
          },
          {
            role: "user",
            content: summary,
          },
        ],
        store: true,
      });
      audioDataBase64 = audioResponse.choices[0]?.message?.audio?.data || "";
    } catch (error) {
      console.error("Error generating audio:", error);
    }

    // 4. Define the JSON Schema (Removed "format" from "date")
    const schema = {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the project, product, or technology",
        },
        date: {
          type: "string",
          description: "Date of assessment or evaluation",
        },
        owner: {
          type: "string",
          description: "Individual or organization owning the project",
        },
        viabilityScore: {
          type: "number",
          description: "10-factor viability score for market/technical potential (0-10)",
        },
      },
      required: ["name", "date", "owner", "viabilityScore"],
      additionalProperties: false, // Prevents additional unspecified properties
    };

    // 7. Structured Response
    let strucresponse = null;
    try {
      const strucresponseAI = await openai.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at structured data extraction. You will be given a summary and should convert it into the given structure." 
          },
          { 
            role: "user", 
            content: summary 
          },
        ],
        response_format: { 
          type: "json_schema", 
          json_schema: {
            "strict": true, 
            "name": "PatentSummary",
            "schema": schema 
          }
        }
      });
      strucresponse = strucresponseAI?.choices[0]?.message?.parsed;
    } catch (error) {
      console.error("Error generating structured response:", error);
    }

    // Return everything to the client
    return res.status(200).json({
      extractedText,
      summary,
      imageUrl,
      audioData: audioDataBase64,
      strucresponse:strucresponse
    });
  } catch (error) {
    console.error("Error in upload-pdf route:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
