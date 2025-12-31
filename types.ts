
export enum CyclePhase {
  Menstruacion = 'menstruación',
  Folicular = 'folicular',
  Ovulacion = 'ovulación',
  Lutea = 'lútea'
}

export enum CheckInType {
  Quick = 'quick',
  Food = 'food',
  Body = 'body'
}

export type PlanCategory = 'plan' | 'food' | 'exercise' | 'focus' | 'love';

export interface QuickPayload {
  hunger: number;
  energy: number;
  mood: number; // Escala 1-10
  note?: string;
}

export interface FoodPayload {
  density: 'ligera' | 'media' | 'densa';
  protein: 'baja' | 'media' | 'alta';
  sweets: 'nada' | 'algo' | 'mucho';
  sensation: 'saciada' | 'con antojo' | 'pesada' | 'con energía';
  weight?: number;
  note?: string;
}

export interface BodyPayload {
  periodDayOne?: boolean;
  flowIntensity?: 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  note?: string;
}

export interface CheckIn {
  id: string;
  timestamp: number;
  type: CheckInType;
  payload: QuickPayload | FoodPayload | BodyPayload;
}

export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export interface UserPreferences {
  theme: Theme;
  bio: string;
  cycleLength: number;
  conditions: string[]; 
  isHealthSynced: boolean;
  lastSyncTimestamp?: number;
}

export interface UserState {
  language: Language;
  name: string;
  preferences: UserPreferences;
  logs: CheckIn[];
  periodHistory: number[];
}
