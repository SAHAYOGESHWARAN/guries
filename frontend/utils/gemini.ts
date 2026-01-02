
import { GoogleGenAI } from "@google/genai";

// Initialize the instance lazily
let aiInstance: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (!aiInstance) {
        // STRICT REQUIREMENT: Use process.env.API_KEY directly
        aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiInstance;
}

export interface AiOptions {
    model?: string;
    useSearch?: boolean;
    useMaps?: boolean;
    thinking?: boolean;
    image?: string; // base64 string
    video?: string; // base64 string or uri
    mimeType?: string;
}

/**
 * General text generation function supporting Search, Maps, Thinking, and Multimodal inputs.
 */
export async function runQuery(prompt: string, options: AiOptions = {}) {
    try {
        const ai = getAiInstance();
        
        // Model Selection Logic
        let model = options.model || 'gemini-2.5-flash';
        
        // Override model for specific features if not explicitly set
        if (options.thinking) model = 'gemini-3-pro-preview';
        else if (options.video || options.image) model = 'gemini-3-pro-preview';
        else if (options.useSearch || options.useMaps) model = 'gemini-2.5-flash'; // Flash is good for grounding

        // Build Config
        const config: any = {};
        
        // Tools
        const tools: any[] = [];
        if (options.useSearch) tools.push({ googleSearch: {} });
        if (options.useMaps) tools.push({ googleMaps: {} });
        if (tools.length > 0) config.tools = tools;

        // Thinking Config
        if (options.thinking) {
            config.thinkingConfig = { thinkingBudget: 16000 }; // 32k is max, 16k is safe
        }

        // Build Contents
        let contentPart: any = { text: prompt };
        const parts = [contentPart];

        if (options.image) {
            parts.push({
                inlineData: {
                    mimeType: options.mimeType || 'image/png',
                    data: options.image
                }
            });
        }
        
        // Execute
        const result = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: config
        });

        const text = result.text || "No response generated.";
        const grounding = result.candidates?.[0]?.groundingMetadata;

        return { text, grounding };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { text: "Error connecting to AI service. Please check your API key or connection." };
    }
}

/**
 * Generate Images using Imagen 3
 */
export async function generateImage(prompt: string, aspectRatio: string = "1:1") {
    try {
        const ai = getAiInstance();
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio as any,
                outputMimeType: 'image/jpeg'
            }
        });
        
        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        return base64 ? `data:image/jpeg;base64,${base64}` : null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
}

/**
 * Start a chat session
 */
export function startChat() {
    try {
        const ai = getAiInstance();
        return ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: 'You are an advanced Marketing AI Assistant within the Guires Control Center. You have access to marketing data concepts. Be professional, concise, and helpful.'
            }
        });
    } catch (error) {
        console.error("Failed to start chat:", error);
        throw error;
    }
}
