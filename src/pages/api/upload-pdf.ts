// pages/api/upload-pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import formidable from "formidable";
import { parsePdfFile } from "../../../lib/parsePdf";
import { 
  callAiSummary, 
  callAiStructured, 
  callAiImage, 
  callAiAudio 
} from "../../../lib/ai/aiSteps"; 
import { storeAnalysis, updateAnalysis } from "../../../lib/db/analysis";
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
    // 1. Parse the form data
    const { fields, filePath } = await parseFormData(req);

    const persona = fields.persona || "";
    const userQuestion = fields.question || "";

    // Grab linkText if present
    const linkText = Array.isArray(fields.linkText) ? fields.linkText[0] : fields.linkText;

    // 2. Create an analysis ID
    const analysisId = uuidv4();

    // 3. Store initial DB record
    const initialRecord = {
      id: analysisId,
      persona: Array.isArray(persona) ? persona[0] : persona,
      userquestion: Array.isArray(userQuestion) ? userQuestion[0] : userQuestion,
      extractedtext: "",
      summary: "",
      imageurl: "",
      audiodata: "",
      strucresponse: "{}",
      createdat: new Date().toISOString(),
      status: "processing",
    };
    await storeAnalysis(initialRecord);

    // Return the analysisId early (client will redirect to /analysis)
    res.status(200).json({ analysisId });

    // 4. Kick off background processing
    processAnalysis({
      analysisId,
      filePath,
      persona: initialRecord.persona,
      userQuestion: initialRecord.userquestion,
      linkText, // optional link-based text
    });
  } catch (err) {
    console.error("Error in upload-pdf route:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

async function processAnalysis({
  analysisId,
  filePath,
  persona,
  userQuestion,
  linkText,
}: {
  analysisId: string;
  filePath: string | null;
  persona: string;
  userQuestion: string;
  linkText?: string;
}) {
  try {
    // STEP A: Extract text
    let extractedText = "";
    if (linkText) {
      // We have link-based text from the patent
      extractedText = linkText;
    } else if (filePath) {
      // We have a PDF file
      extractedText = await parsePdfFile(filePath);
    }

    // If we got nothing at all, mark error
    if (!extractedText) {
      await updateAnalysis(analysisId, { extractedtext: "", status: "error" });
      return;
    }

    // partial update
    await updateAnalysis(analysisId, { extractedtext: extractedText });

    // STEP B: Summarize
    const summary = await callAiSummary({ persona, userQuestion, extractedText });
    await updateAnalysis(analysisId, { summary });

    // STEP C: Structured JSON
    const structured = await callAiStructured({ persona, summary });
    if (structured) {
      await updateAnalysis(analysisId, {
        strucresponse: JSON.stringify(structured),
      });
    }

    // STEP D: Image
    let stableImageUrl = "";
    const imageUrl = await callAiImage({ persona, summary });
    if (imageUrl) {
      try {
        stableImageUrl = await uploadImageFromUrl(imageUrl, analysisId);
      } catch (err) {
        console.error("Error uploading image:", err);
        stableImageUrl = imageUrl; // fallback
      }
      await updateAnalysis(analysisId, { imageurl: stableImageUrl });
    }

    // STEP E: Audio
    const audioData = await callAiAudio({ persona, summary });
    if (audioData) {
      try {
        const audioUrl = await uploadAudioBase64(audioData, analysisId);
        await updateAnalysis(analysisId, { audiodata: audioUrl });
      } catch (err) {
        console.error("Error uploading audio:", err);
      }
    }

    // STEP F: Done
    await updateAnalysis(analysisId, { status: "done" });
  } catch (err) {
    console.error("Error in background processing:", err);
    await updateAnalysis(analysisId, { status: "error" });
  }
}

async function parseFormData(
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; filePath: string | null }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    //@ts-ignore
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      // If no file is uploaded at all, we'll have no "filepath"
      let filePath = null;
      const uploadedFile = files.file;
      if (uploadedFile) {
        const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
        filePath = fileObj.filepath;
      }
      resolve({ fields, filePath });
    });
  });
}
