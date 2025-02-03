// pages/api/upload-pdf.ts

import type { NextApiRequest, NextApiResponse } from "next";
//@ts-ignore
import formidable from "formidable";
import { parsePdfFile } from "../../../lib/parsePdf";
import { callAiSummary, callAiStructured, callAiImage, callAiAudio } from "../../../lib/ai/aiSteps"
// ^ Example: break out your AI calls into smaller steps 
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
    // Parse form data
    const { fields, filePath } = await parseFormData(req);

    const persona = fields.persona || "";
    const userQuestion = fields.question || "";

    // Generate an analysis ID immediately
    const analysisId = uuidv4();

    // Store an initial record with placeholders
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
      status: "processing"
    };

    await storeAnalysis(initialRecord);

    // Immediately return the analysisId so the client can navigate
    res.status(200).json({ analysisId });

    // Then do the heavy lifting in the background
    processAnalysis({ analysisId, filePath, persona, userQuestion });
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
}: {
  analysisId: string;
  filePath: string;
  persona: string;
  userQuestion: string;
}) {
  try {
    //
    // STEP 1: Extract PDF text
    const extractedText = await parsePdfFile(filePath);
    if (!extractedText) {
      await updateAnalysis(analysisId, { extractedtext: "", status: "error" });
      return;
    }

    // Partial update: store extracted text in the "extractedtext" column
    await updateAnalysis(analysisId, { extractedtext: extractedText });

    //
    // STEP 2: Summarize
    //
    const summary = await callAiSummary({ persona, userQuestion, extractedText });
    // Partial update: store summary
    await updateAnalysis(analysisId, { summary });

    //
    // STEP 3: Structured response
    //
    const structured = await callAiStructured({ persona, userQuestion, extractedText });
    // Partial update: store structured response
    await updateAnalysis(analysisId, { strucresponse: JSON.stringify(structured) });

    //
    // STEP 4: Generate/fetch image
    //
    const imageUrl = await callAiImage({ persona, userQuestion, extractedText });
    let stableImageUrl = "";
    if (imageUrl) {
      try {
        stableImageUrl = await uploadImageFromUrl(imageUrl, analysisId);
      } catch (err) {
        console.error("Error uploading image:", err);
        stableImageUrl = imageUrl; // fallback to original
      }
    }
    await updateAnalysis(analysisId, { imageurl: stableImageUrl });

    //
    // STEP 5: Audio data
    //
    const audioData = await callAiAudio({ persona, userQuestion, extractedText });
    let audioUrl = "";
    if (audioData) {
      try {
        audioUrl = await uploadAudioBase64(audioData, analysisId);
      } catch (err) {
        console.error("Error uploading audio:", err);
      }
    }
    await updateAnalysis(analysisId, { audiodata: audioUrl });

    //
    // STEP 6: Mark done
    //
    await updateAnalysis(analysisId, { status: "done" });

  } catch (err) {
    console.error("Error in background processing:", err);
    await updateAnalysis(analysisId, { status: "error" });
  }
}

async function parseFormData(req: NextApiRequest): Promise<{ fields: formidable.Fields; filePath: string }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    // @ts-ignore
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const uploadedFile = files.file;
      if (!uploadedFile) return reject(new Error("No file uploaded"));
      const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      const filePath = fileObj.filepath;
      resolve({ fields, filePath });
    });
  });
}
