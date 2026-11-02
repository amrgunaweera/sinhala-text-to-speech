export interface VoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  sinhalaTitle: string;
  description: string;
  tags: string[];
}

export interface StylePreset {
  id: string;
  name: string;
  sinhalaName: string;
  description: string;
  prompt: string;
  iconName: string;
}

export interface GeneratedClip {
  id: string;
  text: string;
  audioBase64: string;
  mimeType: string;
  voice: string;
  style: string;
  createdAt: number;
  duration?: number;
  charCount: number;
}

export interface SinhalaSample {
  category: string;
  title: string;
  sinhalaText: string;
  englishMeaning: string;
  suggestedVoice: string;
  suggestedStyle: string;
}
