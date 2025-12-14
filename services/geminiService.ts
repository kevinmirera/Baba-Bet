
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getBabaWisdom = async (userQuestion?: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Baba says: 'Pay for the seeds if you want the fruit!' (API Key missing)";

  try {
    let prompt = "You are Baba, a crazy, eccentric African orange farmer in a betting game called Bababet. ";
    
    if (userQuestion) {
        prompt += `You are also an expert in software engineering, football tactics, golf swinging, and modern life, but you explain everything using farming metaphors and broken English/slang. The user asks: "${userQuestion}". Answer the question accurately and helpfully but stay in your eccentric farmer persona. Keep it under 60 words.`;
    } else {
        prompt += "The player asks for a tip on the next throw. Give a short, superstitious, funny, and vague prediction about how far the orange will fly based on the 'wind', your 'rheumatism', or the 'crows'. Do NOT give specific numbers. Keep it under 20 words.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 1.0,
      }
    });
    
    if (response.text) {
        return response.text.trim();
    }
    return "Baba is staring at the clouds... (No clear vision)";
  } catch (error) {
    console.error("Failed to get wisdom:", error);
    return "Baba is napping. Try again later.";
  }
};

export const generateMerchSlogan = async (): Promise<string> => {
  const ai = getClient();
  if (!ai) return "I <3 Oranges";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a very short, funny, satirical slogan for a t-shirt in a farming betting game. Max 5 words. Examples: 'Dholuo Forever', 'Eat Sleep Farm', 'Not Financial Advice', 'Orange You Glad'.",
      config: {
        maxOutputTokens: 20,
        temperature: 1.1,
      }
    });
    return response.text?.trim().replace(/"/g, '') || "Baba Lives";
  } catch (error) {
    return "Farm Life";
  }
};

export const generateModeName = async (): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Custom Field";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a cool, short name for a custom game level/mode in an orange throwing game. It can be sci-fi, rural, or weird. Max 3 words. Examples: 'Neon Farm', 'Mars Yard', 'Grandma's Garden'.",
      config: {
        maxOutputTokens: 15,
        temperature: 1.1,
      }
    });
    return response.text?.trim().replace(/"/g, '') || "New Mode";
  } catch (error) {
    return "My Mode";
  }
};

export const generateModeSlogan = async (): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Subscribe Now!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, punchy billboard advertisement slogan for a background in a video game. It should sound like a fake company or a funny warning. Max 4 words. Examples: 'Drink More Milk', 'Obey The Orange', 'Buy Dirt Now'.",
      config: {
        maxOutputTokens: 15,
        temperature: 1.1,
      }
    });
    return response.text?.trim().replace(/"/g, '') || "Advertise Here";
  } catch (error) {
    return "Buy Seeds";
  }
};

export const generateBabaImage = async (userPrompt: string): Promise<string | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    const fullPrompt = `A funny, vibrant cartoon sticker design of Baba, an eccentric African orange farmer with a straw hat, orange overalls, and a white beard. He is ${userPrompt}. Vector art style, white background, high contrast.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate image:", error);
    return null;
  }
};

export const generateBackgroundImage = async (userPrompt: string): Promise<string | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: userPrompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate background:", error);
    return null;
  }
};
