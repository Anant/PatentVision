// pages/index.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { EnhancedInput } from "../components/EnhancedInput";
import { PersonaSelect } from "@/components/PersonaSelect";
import { RecentAnalysisCard } from "@/components/RecentAnalysisCard";
import { RecentAnalysisCardSkeleton } from "@/components/RecentAnalysisCardSkeleton";

/**
 * LinkItem interface to match EnhancedInput
 */
interface LinkItem {
  url: string;
  text?: string;
  images?: string[];
}

export default function Home() {
  const router = useRouter();

  // We'll track the single PDF file (if any)
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // We'll store *all* patent links in an array
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);

  // We'll still store a combined link text for convenience, 
  // but we actually get it from EnhancedInput 
  const [combinedLinkText, setCombinedLinkText] = useState("");

  // Question, persona, etc.
  const [userQuestion, setUserQuestion] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [recentAnalyses, setRecentAnalyses] = useState<any[] | null>(null);

  //----------------------------------------------------------------
  // 1. Called by EnhancedInput when a PDF is added
  //----------------------------------------------------------------
  const handleAddFiles = (files: File[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  //----------------------------------------------------------------
  // 2. Collect linkItems from EnhancedInput
  //----------------------------------------------------------------
  // Instead of only passing "combined text", we pass the full array of link items.
  const handleLinkItemsChange = (allLinkItems: LinkItem[]) => {
    setLinkItems(allLinkItems);

    // If you still want to maintain a "combined text" in state:
    const combinedText = allLinkItems
      .map((item) => item.text || "")
      .filter((txt) => txt.length > 0)
      .join("\n\n");
    setCombinedLinkText(combinedText);
  };

  //----------------------------------------------------------------
  // 3. Called when user clicks Next => sends data to /api/upload-pdf
  //----------------------------------------------------------------
  const handleUploadAndProcess = async () => {
    // If we have neither PDF nor link text, block
    if (!pdfFile && linkItems.length === 0) {
      alert("Please attach a PDF or a patent link first.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // If we have a PDF, append it
      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      // We'll pass the entire linkItems array as JSON
      if (linkItems.length > 0) {
        const linkData = JSON.stringify(linkItems);
        formData.append("linkData", linkData);
      }

      // Standard fields
      formData.append("question", userQuestion);
      formData.append("persona", selectedPersona);

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error processing PDF/Link");
        return;
      }

      // Navigate to /analysis once the server has accepted the job
      router.push({
        pathname: "/analysis",
        query: {
          analysisId: data.analysisId,
          persona: selectedPersona,
        },
      });
    } catch (err) {
      console.error("Error uploading/parsing:", err);
      alert("Error uploading/parsing file/link");
    } finally {
      setIsLoading(false);
    }
  };

  //----------------------------------------------------------------
  // 4. Fetch recent analyses on mount
  //----------------------------------------------------------------
  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/recent-analyses?limit=6");
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
        {/*
          EnhancedInput:
           - onAddFiles => store PDF in state
           - setQuestion => store user's question
           - onLinkItemsChange => store link item array in state
        */}
        <EnhancedInput
          onAddFiles={handleAddFiles}
          setQuestion={setUserQuestion}
          onLinkItemsChange={handleLinkItemsChange}
        />

        <PersonaSelect
          selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
        />

        <div className="flex justify-end mt-4">
          <Button
            disabled={!selectedPersona}
            onClick={handleUploadAndProcess}
            className={`
              px-6 py-3 rounded-lg transition-all duration-150 ease-in-out
              border 
              ${
                selectedPersona
                  ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  : "bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed"
              }
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

        {/* Recent Analyses Grid */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAnalyses
              ? recentAnalyses.map((analysis) => (
                  <RecentAnalysisCard key={analysis.id} analysis={analysis} />
                ))
              : [1, 2, 3].map((n) => <RecentAnalysisCardSkeleton key={n} />)}
          </div>
        </div>
      </div>
    </main>
  );
}
