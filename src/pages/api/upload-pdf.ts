// pages/api/upload-pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import formidable from "formidable";
import fs from "fs";
//@ts-ignore
import pdfParse from "pdf-parse";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Parse the form data
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      //@ts-ignore
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Extract persona & question from fields
    const persona = fields.persona || "";
    const userQuestion = fields.question || "";

    // 2. Check for "file"
    const uploadedFile = files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
    const filePath = fileObj.filepath;

    // 3. Parse PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text?.trim() || "";
    if (!extractedText) {
      return res.status(400).json({ error: "Failed to extract text from PDF." });
    }

    // 4. Summarize with GPT-4, including persona and user question
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assisting from the perspective of a "${persona}" persona.`
        },
        {
          role: "user",
          content: `
            The user asked: "${userQuestion}"
            Summarize the following patent text in a concise way, from a(n) ${persona} viewpoint:

            ${extractedText}

            Make clear remarks about what persona this is ment for and address the users question as well separatly
          `
        }
      ],
    });

    const summary = chatResponse.choices[0]?.message?.content || "";

    // 5. Generate DALL·E 3 image
    let imageUrl = "";
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Generate an image representing this concept: ${summary} (persona: ${persona}).`,
        n: 1,
        size: "1024x1024",
      });
      imageUrl = imageResponse.data[0]?.url || "";
    } catch (error) {
      console.error("Error generating image:", error);
    }

    // 6. Generate audio
    let audioDataBase64 = "";
    try {
      const audioResponse = await openai.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: "alloy", format: "wav" },
        messages: [
          {
            role: "system",
            content: `You are a helpful AI that produces spoken summaries from a ${persona} perspective.`,
          },
          {
            role: "user",
            content: summary,
          },
        ],
        store: true,
      });
      audioDataBase64 = audioResponse.choices[0]?.message?.audio?.data || "";
    } catch (err) {
      console.error("Error generating audio:", err);
    }

    // 7. (Optional) Structured JSON extraction (like before)
    // Here you'd incorporate persona or question if you like. Example:
    let strucresponse = null;
    try {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          date: { type: "string" },
          owner: { type: "string" },
          viabilityScore: { type: "number" },
        },
        required: ["name", "date", "owner", "viabilityScore"],
        additionalProperties: false,
      };

      const strucresponseAI = await openai.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert at structured data extraction. The user is a ${persona}. 
              You will be given a summary and should convert it into the schema.`
          },
          {
            role: "user",
            content: summary
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            strict: true,
            name: "PatentSummary",
            schema,
          },
        },
      });
      strucresponse = strucresponseAI?.choices[0]?.message?.parsed;
    } catch (error) {
      console.error("Error generating structured response:", error);
    }

    // Return results
    return res.status(200).json({
      extractedText,
      summary,
      imageUrl,
      audioData: audioDataBase64,
      strucresponse,
    });
  } catch (err) {
    console.error("Error in upload-pdf route:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
