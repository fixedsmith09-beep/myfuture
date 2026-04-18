export const EVENT_TYPES = ["문제", "업적", "전환점"] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface LifeEvent {
  id: string;
  age: number;
  title: string;
  type: EventType;
  description: string;
  createdAt: string;
}

export interface ScoredLifeEvent extends LifeEvent {
  score: number;
  aiStrength: string;
  aiRisk: string;
  aiAdvice: string;
}

export interface CumulativePoint {
  age: number;
  label: string;
  cumulativeScore: number;
  eventScore: number;
  type: EventType;
  title: string;
}

export interface LifeSummary {
  totalRecords: number;
  totalScore: number;
  averageScore: number;
  biggestRise?: CumulativePoint;
  biggestDrop?: CumulativePoint;
  typeCount: Record<EventType, number>;
}

export interface AnalysisResult {
  overallFlow: string;
  strengthAnalysis: string;
  riskAnalysis: string;
  patternAnalysis: string;
  currentState: string;
  practicalAdvice: string;
  motivationLine: string;
}

export interface AnalyzeResponse {
  analysis: AnalysisResult;
  scoredEvents: ScoredLifeEvent[];
  fallback: boolean;
}

export interface QuoteResult {
  currentState: string;
  quote: string;
  quoteKorean: string;
  reason: string;
  person: string;
}

export interface AppContentSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeDarkMode: string;
  heroBadgeMobile: string;
  heroBadgeAi: string;
  heroBadgeAdmin: string;
  serviceDescription: string;
  makerReason: string;
  developerIntro: string;
  instagramId: string;
  donationUrl: string;
}

export interface Review {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  createdAt: string;
}
