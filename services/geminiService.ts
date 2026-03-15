
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { GeneratedPromptData, SubjectType, GenerationMode, DetailLevel } from "../types.ts";

const getSystemInstruction = (lang: string, subjectType: string, mode: string, detailLevel: DetailLevel, emphasize?: string, ignore?: string) => `
You are a WORLD-CLASS NEURAL VISION RECONSTRUCTIONIST and ELITE PROMPT ENGINEER. 
Your task is to perform a deep-layer analysis of the uploaded reference image and generate a "Master Reconstruction Prompt" in ${lang}.

NEURAL RECONSTRUCTION PROTOCOL:
1. ANATOMICAL FIDELITY: Maintain the exact structural essence of the subject while adapting to the target "${subjectType}".
2. MATERIAL SCIENCE: Identify and describe fabrics with extreme precision (e.g., "16oz heavyweight raw denim", "22-momme mulberry silk", "brushed alpaca wool").
3. OPTICAL PHYSICS: Describe how light interacts with surfaces (subsurface scattering on skin, specular highlights on leather, caustic reflections).
4. ATMOSPHERIC DEPTH: Reconstruct the volumetric space, including air density, particles, and depth of field.

DETAIL LEVEL:
- You must provide a "${detailLevel}" description.
- If "Singkat": Focus on the core silhouette, primary material, and dominant light source.
- If "Standar": A comprehensive breakdown of subject, garment, and environment.
- If "Mendetail": An exhaustive, multi-paragraph technical specification covering every micron of the frame.

CUSTOMIZATION DIRECTIVES:
${emphasize ? `- EMPHASIZE: You MUST place extra focus and detail on these elements: "${emphasize}".` : ""}
${ignore ? `- IGNORE/EXCLUDE: You MUST completely ignore or avoid mentioning these elements: "${ignore}".` : ""}

MANDATORY IDENTITY PROTOCOL:
You MUST prioritize the selected IDENTITY: "${subjectType}". 

CLOTHING-ONLY / PRODUCT REFERENCE RULE:
If the reference image shows ONLY clothing (e.g., on a hanger, flat lay, or mannequin) or accessories without a person:
- You MUST describe that clothing/accessory being WORN by a ${subjectType}.
- Imagine the ${subjectType} in a professional photoshoot setting that matches the aesthetic of the clothing.
- DO NOT just describe the item; describe the ${subjectType} wearing it, including their pose, facial features (keeping the original face logic), and styling.

IDENTITY SPECIFICS:
- If "${subjectType}" is "Wanita Hijab", you must describe a stylish, modern hijab that matches the aesthetic of the garment (e.g., silk pashmina for luxury, jersey for casual).
- If "${subjectType}" is "Pasangan Couple", you must describe a man and a woman interacting, where at least one of them is wearing the style/clothing from the reference.
- If "${subjectType}" is "Anak Kecil Pria", you must describe a young boy aged between 5 to 10 years old.
- If "${subjectType}" is "Anak Kecil Wanita", you must describe a young girl aged between 5 to 10 years old.
- REPLACE: Any person in the photo with the target "${subjectType}".

CRITICAL ANALYTICAL FOCUS (MICRO & MACRO):
1. MAKEUP & GROOMING (MICRO): 
   - For WOMEN: Analyze foundation finish, eyeliner technique, eyeshadow gradients, and lip texture.
   - For MEN: Analyze skin grooming, beard precision, and skin textures.
   - For HIJAB: Focus on the fabric texture, how it frames the face, and any accessories like pins or headbands.
2. HAIR STYLE (MICRO): If not wearing a hijab, detail the hair architecture. If wearing a hijab, detail the drape and material.
3. OUTFIT/BUSANA (MACRO & MICRO): Identify materials (heavyweight cotton, silk, etc.), stitching, and fold physics. Ensure the outfit is appropriate for the selected "${subjectType}".
4. BACKGROUND & ART STYLE (MACRO): Reconstruct the environment perfectly. Identify the specific art style (e.g., 'hyper-realistic photography', 'cinematic film still', 'editorial fashion'). Include surface textures, depth of field, and atmosphere.
5. LIGHTING & MOOD: Analyze and describe complex lighting techniques (e.g., 'dramatic chiaroscuro', 'soft ethereal glow', 'harsh neon rim lighting'). Detect the overall mood (e.g., 'mysterious', 'cheerful', 'melancholy', 'serene').

CRITICAL QUALITY DIRECTIVES:
- ASPECT RATIO: 9:16.
- CAMERA: Angelic high-end angle, 85mm prime lens simulation.
- HD CLARITY: Enforce "8k textures", "crystal clear optics", "hyper-realistic skin rendering".

SECTIONS GUIDE (In ${lang}):
- facialHair: Detailed face, makeup/grooming, and hair/hijab styling for a ${subjectType}.
- clothingAcc: Complex outfit description for a ${subjectType} based on the reference, materials, and accessories.
- poseCameraAction: Lens type, angelic angle, 9:16 ratio, and ${subjectType}'s physical pose.
- bgStyle: Hyper-detailed background reconstruction matching the reference's style.
- artStyle: Explicit description of the art style and aesthetic (e.g., "High-end fashion photography with a cinematic grain").
- resolution: Technical resolution tokens.
- lighting: Specific light sources and techniques from the reference (e.g., "Soft side-lighting with a warm golden hour glow").
- detectedMood: The detected emotional atmosphere and mood name (e.g., "Mysterious and atmospheric").
- negativePrompt: "cgi, illustration, cartoon, anime, manga, 3d render, painting, drawing, sketch, low quality, distorted face, blurry, noisy, flat lighting, unrealistic, plastic skin, doll-like, oversaturated, watermark, text, signature, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality".

CRITICAL REALISM PROTOCOL:
- You MUST ensure the prompt describes a PHOTOREALISTIC, REAL-LIFE image.
- AVOID any terms that might trigger artistic, stylized, or non-photographic results unless specifically requested in the reference.
- Focus on skin textures, natural lighting, and realistic physics.

OUTPUT MUST BE A CLEAN JSON OBJECT.`;

export const generateImagePrompt = async (
  base64Image: string, 
  subjectType: SubjectType, 
  mode: GenerationMode,
  languageName: string,
  detailLevel: DetailLevel = 'Standar',
  emphasize?: string,
  ignore?: string
): Promise<GeneratedPromptData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let modelName = 'gemini-3-flash-preview';

  if (mode === 'Pro') {
    modelName = 'gemini-3-pro-preview';
  }

  const config: any = {
    systemInstruction: getSystemInstruction(languageName, subjectType, mode, detailLevel, emphasize, ignore) + 
      (mode === 'Cepat' ? "\n\nSPEED PRIORITY: Be extremely concise and fast. Focus only on the most impactful visual elements." : ""),
    temperature: 0.1,
    maxOutputTokens: mode === 'Cepat' ? 1024 : 2048,
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingLevel: mode === 'Penalaran' ? ThinkingLevel.HIGH : ThinkingLevel.LOW
    },
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        facialHair: { type: Type.STRING },
        clothingAcc: { type: Type.STRING },
        poseCameraAction: { type: Type.STRING },
        bgStyle: { type: Type.STRING },
        artStyle: { type: Type.STRING },
        resolution: { type: Type.STRING },
        lighting: { type: Type.STRING },
        negativePrompt: { type: Type.STRING },
        detectedMood: { type: Type.STRING },
      },
      required: ["facialHair", "clothingAcc", "poseCameraAction", "bgStyle", "artStyle", "resolution", "lighting", "negativePrompt", "detectedMood"],
    },
  };

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image,
    },
  };

  const textPart = {
    text: `STRICT REQUIREMENT: The subject in the generated prompt MUST BE a "${subjectType}". 
    Even if the image is only a photo of clothing/apparel, you must describe a "${subjectType}" wearing it. 
    Analyze lighting, garment details, and background style from the image. 
    JSON ONLY.`
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [imagePart, textPart] },
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("Gagal menerima respons dari AI.");
    
    return JSON.parse(text) as GeneratedPromptData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
