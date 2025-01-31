import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import formidable from "formidable";
import { parsePdfFile } from "../../../lib/parsePdf";
import { callAiSummaries } from "../../../lib/ai/callAiSummaries";
import { storeAnalysis } from "../../../lib/db/analysis";
import { v4 as uuidv4 } from "uuid";
import { uploadAudioBase64 } from "../../../lib/uploadAudio";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, filePath } = await parseFormData(req);

    const persona = fields.persona || "";
    const userQuestion = fields.question || "";

    const extractedText = await parsePdfFile(filePath);
    if (!extractedText) {
      return res.status(400).json({ error: "Failed to extract text from PDF." });
    }

    // Summaries from AI
    const { summary, imageUrl, audioData, strucresponse } = await callAiSummaries({
      persona,
      userQuestion,
      extractedText,
    });

    let audioUrl = "";
    if (audioData) {
      try {
        audioUrl = await uploadAudioBase64(audioData);
      } catch (err) {
        console.error("Error uploading audio to Bunny:", err);
        // fallback or handle error
      }
    }

    // Generate a doc ID
    const analysisId = uuidv4();

    // Prepare the record
    const record = {
      id: analysisId,
      persona: persona[0],
      userquestion: userQuestion[0],
      extractedtext: extractedText,
      summary,
      imageurl: imageUrl,
      audiodata: "audioData",
      strucresponse: JSON.stringify(strucresponse),
      createdat: new Date().toISOString(),
    };


    // Store in Astra 
    await storeAnalysis(record);

    // Return the new doc ID + partial data if desired
    return res.status(200).json({
      analysisId,
      summary,
      imageUrl,
      audioData,
      extractedText,
      strucresponse,
    });
  } catch (err) {
    console.error("Error in upload-pdf route:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

async function parseFormData(req: NextApiRequest): Promise<{
  fields: formidable.Fields;
  filePath: string;
}> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    //@ts-ignore
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      const uploadedFile = files.file;
      if (!uploadedFile) {
        return reject(new Error("No file uploaded"));
      }
      const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      const filePath = fileObj.filepath;
      resolve({ fields, filePath });
    });
  });
}