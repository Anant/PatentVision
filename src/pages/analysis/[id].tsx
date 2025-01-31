// pages/analysis/[id].tsx
import React from "react";
import { GetServerSideProps } from "next";
import { fetchAnalysisById } from "../../../lib/db/analysis";
import { ConversationPanel } from "@/components/Analysis/ConversationPanel";
import { AnalysisPanel } from "@/components/Analysis/AnalysisPanel";
import { SuggestedQuestions } from "@/components/Analysis/SuggestedQuestions";

export default function AnalysisByIdPage({ analysisData }: { analysisData: any }) {
  if (!analysisData) {
    // If the record is missing or the ID was invalid
    return <div className="p-6">No analysis found.</div>;
  }

  // Build a minimal conversation array
  const conversation = [
    { role: "user", content: analysisData.persona ? `I am a ${analysisData.persona} persona...` : "Placeholder" },
    { role: "assistant", content: analysisData.summary ? "Here's the summary:" : "Placeholder" },
  ];

  function askQuestion(question: string) {
    console.log("Follow-up question:", question);
  }

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
            parsedStruct={analysisData.strucresponse ? JSON.parse(analysisData.strucresponse) : {}}
          />
        </div>
      </div>
      <div className="p-4 border-t">
        <SuggestedQuestions
          questions={["Key claims?", "Compare to existing art?", "Licensing?"]}
          onQuestionSelect={askQuestion}
        />
      </div>
    </div>
  );
}

// Runs on the server for every request to /analysis/[id]
export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;

  // If 'id' is missing or not a string, gracefully handle it.
  // This will prevent 'Invalid URL' at build time
  if (!id || typeof id !== "string") {
    // Provide empty data or even return notFound to avoid errors
    return { props: { analysisData: null } };
  }

  // Otherwise, fetch from DB
  const analysisDoc = await fetchAnalysisById(id);
  // If fetchAnalysisById returns null/undefined, your page can render "No analysis found."
  return {
    props: {
      analysisData: analysisDoc ?? null,
    },
  };
};
