import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

// Your existing result components are no longer shown here, 
// because we redirect to /analysis for the final display
import { EnhancedInput } from "../components/EnhancedInput";
import { PersonaSelect } from "@/components/PersonaSelect";
import ThemeToggle from "@/components/ThemeToggle"; // Import ThemeToggle

export default function Home() {
  const router = useRouter();

  // States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [userQuestion, setUserQuestion] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle PDF from EnhancedInput
  const handleAddFiles = (files: File[]) => {
    if (files.length > 0) setPdfFile(files[0]);
  };

  // Submit the PDF, question, persona to server
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

      // Now we redirect to /analysis with the returned data
      router.push({
        pathname: "/analysis",
        query: {
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

  return (
    <main className="flex min-h-screen">
      <div className="flex-1 p-8 max-w-7xl mx-auto">
        {/* Header with Title and Theme Toggle */}

        {/* EnhancedInput => pass handleAddFiles + setQuestion */}
        <EnhancedInput
          onAddFiles={handleAddFiles}
          setQuestion={setUserQuestion}
        />

        {/* Persona Select => user picks persona */}
        <PersonaSelect
          selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
        />

        {/* Next Button => final submission */}
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
                : "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
              }
      dark:border-blue-400 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600
    `}
          >
            Next
          </Button>
        </div>


        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
          </div>
        )}
      </div>
    </main>
  );
}
