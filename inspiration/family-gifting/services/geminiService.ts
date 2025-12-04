import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateGiftIdeas = async (
  recipientName: string, 
  age: string, 
  interests: string
): Promise<{ name: string; description: string; estimatedPrice: string }[]> => {
  
  if (!apiKey) {
    console.warn("No API Key available for Gemini.");
    return [
      { name: "Demo: Paint Set", description: "A complete watercolor set", estimatedPrice: "$25" },
      { name: "Demo: Scarf", description: "Woolen scarf", estimatedPrice: "$15" },
    ];
  }

  try {
    const prompt = `Generate 5 creative gift ideas for ${recipientName}, who is ${age} years old and likes ${interests}.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedPrice: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating gift ideas:", error);
    return [];
  }
};