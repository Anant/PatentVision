// components/PatentResults/PatentAudio.tsx
import React from "react";

export function PatentAudio({ audioData }: { audioData: string }) {
  if (!audioData) {
    return null;
  }

  // If it doesn't start with "http", we assume it's base64
  const isBase64 = !audioData.startsWith("http");
  if (isBase64) {
    // base64 usage
    return (
      <audio
        controls
        src={`data:audio/wav;base64,${audioData}`}
        className="w-full mt-2"
      />
    );
  }

  // Otherwise, we have a full URL: e.g. "https://patentvision.b-cdn.net/audio/abc.wav"
  // We want just "abc.wav" to call our proxy route: /api/audio-proxy/abc.wav

  // OPTION A: Basic string approach
  // const fileName = audioData.substring(audioData.lastIndexOf('/') + 1);

  // OPTION B: Use the URL constructor (handles edge cases, query params, etc.)
  let fileName = "";
  try {
    const urlObj = new URL(audioData);
    fileName = urlObj.pathname.split("/").pop() || ""; // e.g. "abc.wav"
  } catch (err) {
    console.error("Invalid audioData URL:", audioData, err);
  }

  if (!fileName) {
    return <p>Invalid audio link</p>;
  }

  // We'll fetch from our server's proxy
  const audioUrl = `/api/audio-proxy/${fileName}`;

  return (
    <audio controls src={audioUrl} className="w-full mt-2" />
  );
}
