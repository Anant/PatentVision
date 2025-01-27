// components/PatentResults/PatentAudio.tsx
import React from "react";

export function PatentAudio({ audioData }: { audioData: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Generated Audio</h2>
      <audio controls src={`data:audio/wav;base64,${audioData}`} className="w-full mt-2" />
    </div>
  );
}
