
export type SubjectType = 'Pria' | 'Wanita Non Hijab' | 'Wanita Hijab' | 'Pasangan Couple' | 'Anak Kecil Pria' | 'Anak Kecil Wanita';
export type GenerationMode = 'Cepat' | 'Penalaran' | 'Pro';
export type DetailLevel = 'Singkat' | 'Standar' | 'Mendetail';
export type LightingStyle = 'Golden Hour' | 'Cinematic Studio' | 'Dramatic Spotlight' | 'Soft Diffused' | 'Neon Glow' | 'Automatic';

export type LanguageCode = 
  | 'id' | 'ms' | 'en' | 'ko' | 'ja' | 'th' 
  | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' 
  | 'ar' | 'zh-cn' | 'zh-tw' | 'hi' | 'vi' | 'tr' | 'nl' | 'pl';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  prefix: string;
}

export interface GeneratedPromptData {
  facialHair: string;
  clothingAcc: string;
  poseCameraAction: string;
  bgStyle: string;
  artStyle: string;
  resolution: string;
  lighting: string;
  negativePrompt: string;
  detectedMood: string;
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imagePreview: string;
  subjectType: SubjectType;
  result: GeneratedPromptData;
  language: LanguageCode;
}
