import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const languages = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'uk', 'zh', 'sv', 'ar', 'no', 'nl', 'fi'];

const medText = `Medicación:
• Suspender Aspirina u otros inhibidores de la agregación plaquetaria como Adiro®, Iscover®, Disgren®, Tiklid®, Plavix® entre 3 y 8 días antes del examen – consulte con su médico si tiene dudas al respecto.
• En caso de tomar Sintrom® u otro anticoagulante (Xarelto®, Pradaxa®…) debe consultar con su médico para valorar su suspensión o sustitución.
• En caso de padecer patología cardíaca: Traiga el electrocardiograma, ecocardiograma y las indicaciones de su cardiólogo. AVISAR SI SE REQUIERE PROFILAXIS ANTIBIÓTICA.
• Hierro oral, suspender 7 días antes de la colonoscopia.
• NO es necesario suspender otros medicamentos – tomar hasta 12 horas antes de la prueba.`;

const impText = `Importante:
• No beba alcohol, leche, o nada de color rojo o morado (por ejemplo, zumo de frutos rojos) u otras bebidas que contengan pulpa.
• No coma mientras toma Pleinvue® y hasta después del procedimiento clínico.
• No podrá conducir el día de la colonoscopia ni manejar maquinaria peligrosa.
• TRAER LOS CONSENTIMIENTOS DE COLONOSCOPIA Y SEDACIÓN FIRMADOS.
• Acuda acompañado a la exploración con alguien que pueda conducir o auxiliarle en su regreso a casa.
• Existe la posibilidad de que, en caso de realizar intervenciones terapéuticas, como extracción de pólipos, sea necesario que cancele sus compromisos el día siguiente, o podría necesitar quedarse en vigilancia durante 24 horas (esta situación es raramente necesaria).`;

async function translate() {
  const translations = {};
  
  for (const lang of languages) {
    console.log(`Translating to ${lang}...`);
    const prompt = `Translate the following two medical texts into the language code '${lang}'. 
    Keep the bullet points and formatting.
    
    Text 1 (Medicación):
    ${medText}
    
    Text 2 (Importante):
    ${impText}
    
    Also provide a spoken narrative version of each text in the same language, which should be natural to read aloud (e.g., replace symbols with words, expand abbreviations, remove bullet points and make it a continuous paragraph).
    
    Return JSON with keys: med_title, med_desc, med_narrative, imp_title, imp_desc, imp_narrative.
    For the titles, use the translation of "Medicación" and "Importante".
    For the descriptions, use the exact translated bulleted texts.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            med_title: { type: Type.STRING },
            med_desc: { type: Type.STRING },
            med_narrative: { type: Type.STRING },
            imp_title: { type: Type.STRING },
            imp_desc: { type: Type.STRING },
            imp_narrative: { type: Type.STRING },
          },
          required: ["med_title", "med_desc", "med_narrative", "imp_title", "imp_desc", "imp_narrative"]
        }
      }
    });

    translations[lang] = JSON.parse(response.text);
  }
  
  fs.writeFileSync('translations.json', JSON.stringify(translations, null, 2));
  console.log('Done!');
}

translate().catch(console.error);
