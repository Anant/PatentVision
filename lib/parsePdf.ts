import fs from "fs";
//@ts-ignore
import pdfParse from "pdf-parse";

/**
 * Reads a PDF from disk and returns the extracted text.
 * @param filePath path to the uploaded PDF file
 * @returns the extracted text
 */
export async function parsePdfFile(filePath: string): Promise<string> {
  const pdfBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(pdfBuffer);
  return pdfData.text?.trim() || "";
}
