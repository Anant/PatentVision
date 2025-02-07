// lib/ai/aiSteps.ts
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!, // or manage via env
});

interface AiParams {
    persona: string;
    userQuestion?: string;
    extractedText?: string;
    summary?: string;
    images?: string[];
}

/**
 * STEP 1: Summarize
 * (Prompt from your old "callAiSummaries")
 */
export async function callAiSummary(params: AiParams): Promise<string> {
    const { persona, userQuestion = "", extractedText = "", images = [] } = params;

    // We build a multi-modal user message:
    //   1) text about the user’s question + patent
    //   2) each image with type: "image_url"
    const userMessage = [
        {
            type: "text",
            text: `
        The user asked: "${userQuestion}"
        Summarize this patent text from a(n) ${persona} viewpoint:
  
        ${extractedText}
  
        Make remarks about what persona this is meant for and address the user's question separately.
      `,
        },
        ...images.map((imgUrl) => ({
            type: "image_url" as const,
            image_url: { url: imgUrl },
        })),
    ];

    // Now we call the Chat Completions API with multi-modal content
    const chatResponse = await openai.chat.completions.create({
        model: "gpt-4o",  // or "gpt-4o-mini" if you want the smaller model
        messages: [
            {
                role: "system",
                content: `You are a helpful AI assisting from the perspective of a "${persona}" persona.`,
            },
            {
                role: "user",
                // For multi-modal: the `content` can be an array
                // @ts-ignore
                content: userMessage,
            },
        ],
        // store: true, // optional if you want the conversation stored
    });

    // Return the text of the assistant's message
    return chatResponse.choices[0]?.message?.content || "";
}

/**
 * STEP 2: Structured JSON
 * Now includes both the summary and extracted text for better context.
 */
export async function callAiStructured(params: AiParams): Promise<any> {
    const { persona, summary = "", extractedText = "" } = params;

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
Convert the following information into the given schema:
Summary: ${summary}
Extracted Text: ${extractedText}`,
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

    return strucresponse;
}

/**
 * STEP 3: Image Generation (DALL·E 3)
 * Now includes the extracted text as extra context.
 */
export async function callAiImage(params: AiParams): Promise<string> {
    const { persona, summary = "", extractedText = "" } = params;

    let imageUrl = "";
    try {
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Generate an image representing the concept: ${summary}.
(Persona: ${persona}).`,
            n: 1,
            size: "1024x1024",
        });
        imageUrl = imageResponse.data[0]?.url || "";
    } catch (err) {
        console.error("Error generating image:", err);
    }
    return imageUrl;
}

/**
 * STEP 4: Audio Generation
 * (Same as before—using the summary as the content.)
 */
export async function callAiAudio(params: AiParams): Promise<string> {
    const { persona, summary = "" } = params;

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

    return audioData;
}
