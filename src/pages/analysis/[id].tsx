// No getServerSideProps. Pure client fetch.

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ConversationPanel } from "@/components/Analysis/ConversationPanel";
import { AnalysisPanel } from "@/components/Analysis/AnalysisPanel";
import { SuggestedQuestions } from "@/components/Analysis/SuggestedQuestions";

export default function AnalysisClientOnlyPage() {
  const router = useRouter();
  const { id } = router.query;

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return; // Wait for Next.js to parse [id]

    fetch(`/api/analysis/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setAnalysisData(json.analysisData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!analysisData) return <div>No analysis found</div>;

  // Normal UI with analysisData
  const conversation = [
    { role: "user", content: analysisData.persona ?? "Placeholder" },
    { role: "assistant", content: analysisData.summary ? "Here's the summary:" : "Placeholder" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 grid md:grid-cols-[1fr_2fr] divide-x">
        <div className="p-6 overflow-y-auto">
          <ConversationPanel conversation={conversation as any} />
        </div>
        <div className="p-4 overflow-auto">
          <AnalysisPanel
            summary={analysisData.summary}
            imageUrl={analysisData.imageurl}
            audioData={analysisData.audiodata}
            extractedText={analysisData.extractedtext}
            parsedStruct={
              analysisData.strucresponse
                ? JSON.parse(analysisData.strucresponse)
                : {}
            }
          />
        </div>
      </div>
      <div className="p-4 border-t">
        <SuggestedQuestions
          questions={["Key claims?", "Compare to existing art?", "Licensing?"]}
          onQuestionSelect={(q) => console.log("Follow-up question:", q)}
        />
      </div>
    </div>
  );
}