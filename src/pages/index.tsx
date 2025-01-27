import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { EnhancedInput } from "../components/EnhancedInput";
import { PatentSummary } from "@/components/PatentResults/PatentSummary";
import { PatentImage } from "../components/PatentResults/PatentImage";
import { PatentAudio } from "@/components/PatentResults/PatentAudio";
import { PatentStructuredDetails } from "../components/PatentResults/PatentStructuredDetails";
import { ExtractedPdfText } from "@/components/PatentResults/ExtractedPdfText";

export default function Home() {
  // ----------- States for PDF processing results -----------
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

  // ----------- 1. Callback from EnhancedInput -----------
  const handleAddFiles = (files: File[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  // ----------- 2. Upload & Process PDF -----------
  const handleUploadAndProcess = async (message: string) => {
    if (!pdfFile) {
      alert("Please select or attach a PDF file first.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      // formData.append("userPrompt", message);

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error processing PDF");
        return;
      }

      // Update state with results
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

  // -------------- Render --------------
  return (
    <main className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-800">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Patent Vision PoC</h1>

        {/* Enhanced Input */}
        <EnhancedInput onAddFiles={handleAddFiles} onAskQuestion={handleUploadAndProcess} />

        {isLoading && (
          <p className="mt-4 text-blue-400">Processing... please wait.</p>
        )}

        {/* 1. PatentSummary */}
        {summary && <PatentSummary summary={summary} />}

        {/* 2. PatentImage */}
        {imageUrl && <PatentImage imageUrl={imageUrl} />}

        {/* 3. PatentAudio */}
        {audioData && <PatentAudio audioData={audioData} />}

        {/* 4. PatentStructuredDetails */}
        {strucresponse && <PatentStructuredDetails details={strucresponse} />}

        {/* 5. Extracted PDF Text */}
        {extractedText && (
          <ExtractedPdfText
            extractedText={extractedText}
            showExtractedText={showExtractedText}
            setShowExtractedText={setShowExtractedText}
          />
        )}
      </div>
    </main>
  );
}
