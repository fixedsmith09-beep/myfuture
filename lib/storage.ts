import { AppContentSettings } from "@/types/life";

export const STORAGE_KEYS = {
  events: "life-graph-events",
  lifeGoal: "life-graph-goal",
  reviews: "life-graph-reviews",
  savedQuotes: "life-graph-saved-quotes",
  appSettings: "life-graph-app-settings",
} as const;

export const DEFAULT_SETTINGS: AppContentSettings = {
  heroEyebrow: "Life Graph AI",
  heroTitle: "당신의 인생을 그래프로 보세요",
  heroSubtitle:
    "이루고 싶은 인생 목표를 먼저 정하고, 그 목표로 가는 과정의 문제/업적/전환점을 기록하세요. AI가 각 기록을 나이와 맥락으로 채점하고 인간적으로 코멘트합니다.",
  heroBadgeDarkMode: "다크모드 기본",
  heroBadgeMobile: "모바일 최적화",
  heroBadgeAi: "AI 분석 + 명언",
  heroBadgeAdmin: "관리자 페이지",
  serviceDescription:
    "이 서비스는 목표 달성 과정의 기록을 AI가 맥락 중심으로 읽고, 기록별 강점/문제점/다음 행동을 구체적으로 제안합니다.",
  makerReason:
    "인생 기록은 시간이 지나면 미화되거나 축소되기 쉽습니다. 그래서 사실 기반 기록과 냉정한 피드백이 필요하다고 생각해 만들었습니다.",
  developerIntro:
    "제품/프론트엔드/백엔드를 모두 다루며, 사용자 행동 데이터와 감성적인 UX를 함께 설계하는 개발자입니다.",
  instagramId: "@your_instagram_id",
  donationAccount: "국민은행 123456-78-901234 (예금주: 홍길동)",
};
