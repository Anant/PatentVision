// pages/api/upload-pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import formidable from "formidable";
import { parsePdfFile } from "../../../lib/parsePdf";
import {
  callAiSummary,
  callAiStructured,
  callAiImage,
  callAiAudio,
} from "../../../lib/ai/aiSteps";
import { storeAnalysis, updateAnalysis } from "../../../lib/db/analysis";
import { v4 as uuidv4 } from "uuid";
import { uploadAudioBase64 } from "../../../lib/uploadAudio";
import { uploadImageFromUrl } from "../../../lib/uploadImage";

export const config = {
  api: { bodyParser: false },
};

interface LinkItem {
  url: string;
  text?: string;
  images?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Parse the form data
    const { fields, filePath } = await parseFormData(req);

    const persona = fields.persona || "";
    const userQuestion = fields.question || "";

    // 2. Parse any linkData JSON (array of link items)
    let linkItems: LinkItem[] = [];
    const linkData = Array.isArray(fields.linkData) ? fields.linkData[0] : fields.linkData;
    if (linkData) {
      try {
        linkItems = JSON.parse(linkData) as LinkItem[];
      } catch (err) {
        console.error("Error parsing linkData JSON:", err);
      }
    }

    // 3. Create an analysis ID
    const analysisId = uuidv4();

    // 4. Store initial DB record
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

    // Return the analysisId so the client can redirect
    res.status(200).json({ analysisId });

    // 5. Kick off background processing
    processAnalysis({
      analysisId,
      filePath,
      persona: initialRecord.persona,
      userQuestion: initialRecord.userquestion,
      linkItems, // Pass the array of link items
    });
  } catch (err) {
    console.error("Error in upload-pdf route:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

//-----------------------------------------------
// Background processing
//-----------------------------------------------
async function processAnalysis({
  analysisId,
  filePath,
  persona,
  userQuestion,
  linkItems,
}: {
  analysisId: string;
  filePath: string | null;
  persona: string;
  userQuestion: string;
  linkItems: LinkItem[];
}) {
  try {
    // STEP A: Combine text from linkItems + PDF (if any)
    let combinedText = "";
    // 1) If we have PDF
    if (filePath) {
      const pdfText = await parsePdfFile(filePath);
      if (pdfText) {
        combinedText += pdfText;
      }
    }
    // 2) Add link items text
    const linksText = linkItems.map((l) => l.text || "").join("\n\n");
    if (linksText) {
      if (combinedText) combinedText += "\n\n"; // optional spacer
      combinedText += linksText;
    }

    if (!combinedText) {
      // We ended up with no text at all
      await updateAnalysis(analysisId, { extractedtext: "", status: "error" });
      return;
    }

    // partial update: store the combined text in DB
    await updateAnalysis(analysisId, { extractedtext: combinedText });

    // STEP B: Gather images from all linkItems
    // (One big array of URLs)
    const allImages = linkItems.flatMap((l) => l.images || []);

    // STEP C: Summarize
    // We'll pass both combinedText + the images to callAiSummary
    const summary = await callAiSummary({
      persona,
      userQuestion,
      extractedText: combinedText,
      images: allImages, 
    });
    await updateAnalysis(analysisId, { summary });

    // STEP D: Structured JSON
    const structured = await callAiStructured({ persona, summary });
    if (structured) {
      await updateAnalysis(analysisId, {
        strucresponse: JSON.stringify(structured),
      });
    }

    // STEP E: Some Image from Stable Diffusion? (callAiImage)
    // (This is optional, your code might do it differently)
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

    // STEP F: Audio 
    const audioData = await callAiAudio({ persona, summary });
    if (audioData) {
      try {
        const audioUrl = await uploadAudioBase64(audioData, analysisId);
        await updateAnalysis(analysisId, { audiodata: audioUrl });
      } catch (err) {
        console.error("Error uploading audio:", err);
      }
    }

    // STEP G: Mark done
    await updateAnalysis(analysisId, { status: "done" });
  } catch (err) {
    console.error("Error in background processing:", err);
    await updateAnalysis(analysisId, { status: "error" });
  }
}

//-----------------------------------------------
// Parse Form Data
//-----------------------------------------------
async function parseFormData(
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; filePath: string | null }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    // @ts-ignore
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
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
