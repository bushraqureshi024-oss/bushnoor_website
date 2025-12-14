import { GoogleGenAI } from "@google/genai";
import { ImageResolution } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Chatbot functionality
export const sendChatMessage = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview', // High quality for customer service
      config: {
        systemInstruction: "You are the AI stylist assistant for BushNoor. We specialize in high-end Party Wear and Wedding Wear. Be polite, sophisticated, and helpful. Do not mention prices unless asked. If asked about the Virtual Try-On, explain that they can upload a photo to see themselves in our dresses. Keep responses concise.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am currently experiencing high traffic. Please try again later.";
  }
};

// Virtual Try-On functionality (Image Generation/Editing)
export const generateTryOnImage = async (
  userImageBase64: string,
  productImageUrl: string,
  resolution: ImageResolution = ImageResolution.RES_1K
): Promise<string> => {
  try {
    // 1. Fetch the product image and convert to base64
    const productResp = await fetch(productImageUrl);
    const productBlob = await productResp.blob();
    const productBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(productBlob);
    });

    // Clean base64 strings (remove data:image/xyz;base64, prefix)
    const cleanUserImage = userImageBase64.split(',')[1];
    const cleanProductImage = productBase64.split(',')[1];

    // 2. Call Gemini
    // Using gemini-3-pro-image-preview for high fidelity visual generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
            { text: "Generate a photorealistic image of the woman in the first image wearing the dress shown in the second image. Maintain her exact pose, body shape, and facial features. The lighting should be elegant and flattering." },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanUserImage
              }
            },
            {
              inlineData: {
                mimeType: 'image/jpeg', // Assuming standard format
                data: cleanProductImage
              }
            }
        ]
      },
      config: {
        imageConfig: {
            imageSize: resolution,
            aspectRatio: "3:4" 
        }
      }
    });

    // 3. Extract Image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Try-On Error:", error);
    throw error;
  }
};