import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // or manage via env
});

interface AiSummaryParams {
  persona: string;
  userQuestion: string;
  extractedText: string;
}

/** 
 * Calls OpenAI to (1) Summarize, (2) Generate image, (3) Generate audio, (4) Extract structured data 
 */
export async function callAiSummaries(params: AiSummaryParams) {
  const { persona, userQuestion, extractedText } = params;

  // 1) Summarize
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a helpful AI assisting from the perspective of a "${persona}" persona.`,
      },
      {
        role: "user",
        content: `
          The user asked: "${userQuestion}"
          Summarize this patent text in a concise way, from a(n) ${persona} viewpoint:

          ${extractedText}

          Make remarks about what persona this is meant for and address the user's question separately.
        `,
      },
    ],
  });
  const summary = chatResponse.choices[0]?.message?.content || "";

  // 2) Image Generation (DALL·E 3)
  let imageUrl = "";
  try {
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Generate an image representing the concept: ${summary} (persona: ${persona}).`,
      n: 1,
      size: "1024x1024",
    });
    imageUrl = imageResponse.data[0]?.url || "";
  } catch (err) {
    console.error("Error generating image:", err);
  }

  // 3) Audio Summaries
  let audioData = "";
  try {
    const audioResponse = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice: "alloy", format: "wav" },
      messages: [
        {
          role: "system",
          content: `You are a helpful AI that produces spoken summaries from a ${persona} perspective.`,
        },
        { role: "user", content: summary },
      ],
      store: true,
    });
    audioData = audioResponse.choices[0]?.message?.audio?.data || "";
  } catch (err) {
    console.error("Error generating audio:", err);
  }

  // 4) Structured JSON
  let strucresponse = null;
  try {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        date: { type: "string" },
        owner: { type: "string" },
        viabilityScore: { type: "number" },
      },
      required: ["name", "date", "owner", "viabilityScore"],
      additionalProperties: false,
    };

    const strucresponseAI = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at structured data extraction. The user is a ${persona}. 
                    Convert the summary into the schema.`,
        },
        { role: "user", content: summary },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          strict: true,
          name: "PatentSummary",
          schema,
        },
      },
    });
    strucresponse = strucresponseAI.choices[0]?.message?.parsed;
  } catch (err) {
    console.error("Error generating structured response:", err);
  }

  return {
    summary,
    imageUrl,
    audioData,
    strucresponse,
  };
}
