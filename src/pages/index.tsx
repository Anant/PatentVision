import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { EnhancedInput } from "../components/EnhancedInput";

export default function Home() {
  // Existing states to handle PDF processing results
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [strucresponse, setStrucresponse] = useState<{
    name: string;
    date: string;
    owner: string;
    viabilityScore: number;
    additionalInfo?: string;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [audioData, setAudioData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  /**
   * 1. Callback from EnhancedInput to attach PDF files
   *    For now, we just pick the first PDF from the array.
   */
  const handleAddFiles = (files: File[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  /**
   * 2. The "Process" function: calls /api/upload-pdf with the attached PDF
   *    (You could also send user prompt/links as needed)
   */
  const handleUploadAndProcess = async (message: string) => {
    if (!pdfFile) {
      alert("Please select or attach a PDF file first.");
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      // formData.append("userPrompt", message); // if you want to pass user text

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error processing PDF");
        return;
      }

      // Save results to state
      setExtractedText(data.extractedText || "");
      setSummary(data.summary || "");
      setImageUrl(data.imageUrl || "");
      setAudioData(data.audioData || "");
      setStrucresponse(data.strucresponse || null);
      setShowExtractedText(false);

    } catch (err) {
      console.error("Error uploading/parsing PDF:", err);
      alert("Error uploading/parsing PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-800">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Patent Vision PoC</h1>

        {/******************************************************************** 
         * EnhancedInput: user can add files, links, and ask a question.
         * - onAddFiles => triggered when user attaches PDFs
         * - onAskQuestion => calls handleUploadAndProcess with user message
         *********************************************************************/}
        <EnhancedInput
          onAddFiles={handleAddFiles}
          onAskQuestion={(question) => handleUploadAndProcess(question)}
        />

        {isLoading && (
          <p className="mt-4 text-blue-400">Processing... please wait.</p>
        )}

        {/* Summary */}
        {summary && (
          <div className="mt-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p className="border border-gray-700 bg-gray-800 p-3 rounded">
              {summary}
            </p>
          </div>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
            <img
              src={imageUrl}
              alt="Generated Patent Visualization"
              className="border border-gray-700 rounded"
            />
          </div>
        )}

        {/* Audio */}
        {audioData && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Generated Audio</h2>
            <audio
              controls
              src={`data:audio/wav;base64,${audioData}`}
              className="w-full mt-2"
            />
          </div>
        )}

        {/* Structured Patent Details */}
        {strucresponse && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Patent Details</h2>
            <div className="border border-gray-700 bg-gray-800 p-4 rounded">
              <p>
                <span className="font-semibold">Name:</span> {strucresponse.name}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {strucresponse.date}
              </p>
              <p>
                <span className="font-semibold">Owner:</span> {strucresponse.owner}
              </p>
              <p>
                <span className="font-semibold">Viability Score:</span>{" "}
                {strucresponse.viabilityScore}/10
              </p>
              {strucresponse.additionalInfo && (
                <p>
                  <span className="font-semibold">Additional Info:</span>{" "}
                  {strucresponse.additionalInfo}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Extracted Text Panel */}
        {extractedText && (
          <div className="my-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Extracted PDF Text</h2>
              <button
                className="text-sm px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={() => setShowExtractedText(!showExtractedText)}
              >
                {showExtractedText ? "Hide" : "Show"}
              </button>
            </div>

            {showExtractedText && (
              <div className="border border-gray-700 bg-gray-800 p-3 rounded h-64 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {extractedText}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
