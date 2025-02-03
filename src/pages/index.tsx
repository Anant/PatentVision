// pages/index.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { EnhancedInput } from "../components/EnhancedInput";
import { PersonaSelect } from "@/components/PersonaSelect";
import { RecentAnalysisCard } from "@/components/RecentAnalysisCard";

export default function Home() {
  const router = useRouter();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  // Handle PDF from EnhancedInput
  const handleAddFiles = (files: File[]) => {
    if (files.length > 0) setPdfFile(files[0]);
  };

  // Submit the PDF, question, persona to the server
  const handleUploadAndProcess = async () => {
    if (!pdfFile) {
      alert("Please select or attach a PDF file first.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("question", userQuestion);
      formData.append("persona", selectedPersona);

      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error processing PDF");
        return;
      }

      // Redirect to /analysis with returned data
      router.push({
        pathname: "/analysis",
        query: {
          analysisId: data.analysisId,
          summary: data.summary || "",
          imageUrl: data.imageUrl || "",
          audioData: data.audioData || "",
          extractedText: data.extractedText || "",
          strucresponse: JSON.stringify(data.strucresponse || {}),
          persona: selectedPersona,
        },
      });
    } catch (err) {
      console.error("Error uploading/parsing PDF:", err);
      alert("Error uploading/parsing PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent analyses on mount
  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/recent-analyses?limit=5");
        const data = await res.json();
        setRecentAnalyses(data);
      } catch (err) {
        console.error("Error fetching recent analyses", err);
      }
    }
    fetchRecent();
  }, []);

  return (
    <main className="flex min-h-screen">
      <div className="flex-1 p-8 max-w-7xl mx-auto">
        {/* Your PDF upload and persona selection UI */}
        <EnhancedInput onAddFiles={handleAddFiles} setQuestion={setUserQuestion} />
        <PersonaSelect selectedPersona={selectedPersona} setSelectedPersona={setSelectedPersona} />

        <div className="flex justify-end mt-4">
          <Button
            disabled={!selectedPersona}
            onClick={() => {
              console.log("Persona chosen:", selectedPersona);
              console.log("User typed question:", userQuestion);
              handleUploadAndProcess();
            }}
            className={`
              px-6 py-3 rounded-lg transition-all duration-150 ease-in-out
              border 
              ${selectedPersona
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"}
              dark:border-blue-400 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600
            `}
          >
            Next
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
          </div>
        )}

        {/* Recent analyses grid */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAnalyses.map((analysis) => (
              <RecentAnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
