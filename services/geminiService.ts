
import { GoogleGenAI, Modality } from "@google/genai";

// Ensure the API key is available from environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you might want to show a message to the user or disable functionality.
  // For this example, we'll throw an error to make it clear during development.
  console.error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash-image-preview';

const PROMPT = `Transform this product photo into a high-quality, studio-style image.
- Background: The background should be a clean, neutral, and unobtrusive light gray gradient (#f0f0f0 to #e0e0e0), completely replacing the original background.
- Lighting: Apply soft, balanced, diffuse studio lighting to eliminate harsh shadows and highlight the product's details naturally.
- Color & Realism: Perform subtle color correction to make the product's colors vibrant and accurate. Preserve the product's original shape, texture, and all details faithfully.
- Final Look: The output should be a photorealistic, professional image suitable for a modern e-commerce catalog. Do not add any text or watermarks.
`;

export const transformImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: PROMPT,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    // If the loop finishes without returning, it means no image was found.
    throw new Error("No image was generated in the response. The model may have returned text instead.");
  
  } catch (error) {
    console.error("Error transforming image:", error);
    if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
            throw new Error('Image generation was blocked due to safety policies.');
        }
        if (error.message.includes('429') || error.message.includes('resource exhausted')) {
            throw new Error('You have exceeded your API quota. Please try again later.');
        }
        throw new Error(`Failed to process image: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image transformation.");
  }
};
