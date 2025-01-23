import React, { useState } from "react";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioData, setAudioData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error processing PDF");
        return;
      }

      setExtractedText(data.extractedText || "");
      setSummary(data.summary || "");
      setImageUrl(data.imageUrl || "");
      setAudioData(data.audioData || "");
      setShowExtractedText(false);
    } catch (err) {
      console.error("Error uploading/parsing PDF:", err);
      alert("Error uploading/parsing PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Patent PDF Uploader PoC</h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {/* Choose File (PDF) */}
          <div>
            <label className="relative cursor-pointer rounded bg-gray-700 px-4 py-2 hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
              <span className="text-sm font-medium">Choose PDF</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {pdfFile && (
              <p className="mt-2 text-sm text-gray-300">
                Selected file: <span className="font-semibold">{pdfFile.name}</span>
              </p>
            )}
          </div>

          {/* Upload & Process Button */}
          <button
            onClick={handleUploadAndProcess}
            disabled={isLoading}
            className="rounded bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Upload & Process"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content (Summary, Image, Audio) */}
          <div className="flex-1">
            {/* Summary */}
            {summary && (
              <div className="mb-6">
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
          </div>

          {/* Extracted Text Panel */}
          {extractedText && (
            <div className="md:w-1/3">
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
      </div>
    </main>
  );
}
