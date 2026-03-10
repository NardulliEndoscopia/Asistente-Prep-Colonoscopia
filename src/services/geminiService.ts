import { GoogleGenAI } from "@google/genai";

// Vite incrusta el valor de GEMINI_API_KEY en el bundle durante el build
const apiKey: string = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export async function getChatResponse(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  lang: string
) {
  if (!apiKey) {
    return "El asistente no está disponible. Contacte con la clínica.";
  }
  try {
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `Eres un asistente virtual amable de la clínica del Dr. Nardulli (gastroenterología).
        Ayudas a los pacientes a prepararse para su colonoscopia.
        Responde en el idioma: ${lang}.
        Sé breve, claro y tranquilizador.
        Si no sabes algo, indica que contacten con la clínica.`,
      },
    });
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error en el chat:", error);
    return "Ha ocurrido un error. Por favor contacte con la clínica directamente.";
  }
}
