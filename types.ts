export interface DreamEntry {
  id: string;
  timestamp: number;
  keywords: {
    scenes: string[];
    characters: string[];
    emotions: string[];
    objects: string[];
  };
  decoding: {
    strongestEmotion: string;
    recentLifeLink: string;
    movieTheme: string;
  };
  association: string; // Free text association
  aiReflection?: string; // The gentle insight provided by Gemini
}

export enum ViewState {
  HOME = 'HOME',
  RECORD = 'RECORD',
  DETAILS = 'DETAILS',
  INSIGHTS = 'INSIGHTS',
}

export interface ChartDataPoint {
  name: string;
  value: number;
}