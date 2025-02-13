import React from "react";

export function PatentAudio({ audioData }: { audioData: string }) {
  if (!audioData) return null;

  // If the audioData doesn't start with "http", assume it's a base64-encoded WAV.
  const isBase64 = !audioData.startsWith("http");
  if (isBase64) {
    return (
      <audio
        controls
        src={`data:audio/wav;base64,${audioData}`}
        className="w-full mt-2"
      />
    );
  }

  // Otherwise, it's a direct URL, so just use it as-is.
  return <audio controls src={audioData} className="w-full mt-2" />;
}
