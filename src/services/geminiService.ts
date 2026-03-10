import { GoogleGenAI } from "@google/genai";

// Compatibilidad: funciona tanto en desarrollo local como en Google Cloud Run
const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
  ? process.env.GEMINI_API_KEY
  : (import.meta as any).env?.VITE_GEMINI_API_KEY ?? '';

const ai = new GoogleGenAI({ apiKey });

export async function getChatResponse(message: string, history: { role: string, parts: { text: string }[] }[], lang: string) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a friendly and reassuring AI assistant for Dr. Nardulli's gastroenterology clinic. 
        Your goal is to help patients prepare for their colonoscopy. 
        Answer questions about the diet, the Pleinvue kit, and the procedure steps. 
        Always be encouraging and supportive. 
        Respond in the language: ${lang}. 
        If you don't know something, advise them to contact the clinic directly. 
        Keep responses concise and easy to understand for patients who might be nervous.`,
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again or contact the clinic.";
  }
}
