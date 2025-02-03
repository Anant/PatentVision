import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import formidable from "formidable";
import { parsePdfFile } from "../../../lib/parsePdf";
import { callAiSummaries } from "../../../lib/ai/callAiSummaries";
import { storeAnalysis } from "../../../lib/db/analysis";
import { v4 as uuidv4 } from "uuid";
import { uploadAudioBase64 } from "../../../lib/uploadAudio";
import { uploadImageFromUrl } from "../../../lib/uploadImage";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data
    const { fields, filePath } = await parseFormData(req);

    const persona = fields.persona || "";
    const userQuestion = fields.question || "";

    // Extract PDF text
    const extractedText = await parsePdfFile(filePath);
    if (!extractedText) {
      return res.status(400).json({ error: "Failed to extract text from PDF." });
    }

    // Call AI Summaries
    const { summary, imageUrl, audioData, strucresponse } = await callAiSummaries({
      persona,
      userQuestion,
      extractedText,
    });

    // Generate analysis ID (this will be used as doc ID AND audio filename)
    const analysisId = uuidv4();

    // If we have audio data, upload it to Bunny using analysisId
    let audioUrl = "";
    if (audioData) {
      try {
        audioUrl = await uploadAudioBase64(audioData, analysisId);
      } catch (err) {
        console.error("Error uploading audio to Bunny:", err);
      }
    }

    // 2. If AI returned imageUrl, fetch & reupload to Bunny
    let stableImageUrl = "";
    if (imageUrl) {
      try {
        stableImageUrl = await uploadImageFromUrl(imageUrl, analysisId);
      } catch (err) {
        console.error("Error uploading image to Bunny:", err);
        stableImageUrl = imageUrl; // fallback: store the original
      }
    }

    // Prepare record for Cassandra
    const record = {
      id: analysisId,
      persona: Array.isArray(persona) ? persona[0] : persona,
      userquestion: Array.isArray(userQuestion) ? userQuestion[0] : userQuestion,
      extractedtext: extractedText,
      summary,
      imageurl: stableImageUrl, // or also upload to Bunny if you want
      audiodata: audioUrl, // we store the final bunny URL here
      strucresponse: JSON.stringify(strucresponse),
      createdat: new Date().toISOString(),
    };

    // Store in Astra
    await storeAnalysis(record);

    // Return data to client
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
