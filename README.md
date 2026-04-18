# Life Graph AI

인생 기록을 시간축으로 입력하면 누적 점수 그래프를 만들고, AI가 객관적인 분석과 맞춤 명언을 제공하는 웹 서비스입니다.

## 기술 스택

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Recharts (Line Chart)
- OpenAI API (서버 라우트)
- 로컬 상태 + localStorage 저장

## 주요 기능

- 인생의 핵심 목표 1개 입력
- 목표 달성 과정 기록 입력 (나이/기록 제목/유형/설명)
- 메인 홈(`/`)과 목표 분석 페이지(`/analyze`) 분리
- 메인 홈에 오늘의 랜덤 한마디 + 분석 시작하기 버튼
- 메인에서 유료 이용 코드 입력 후 분석 서비스 이용
- 유료 이용 코드는 1회용이며 사용 즉시 소멸
- 메인 홈에 사용자 리뷰/서비스 설명/만든 이유/개발자 소개 섹션
- 모든 기록 입력 후 AI가 맥락/나이를 보고 기록별 점수 자동 채점
- 점수 계산 및 시간순 누적 그래프
- AI 인생 분석 카드 (7개 항목, 더 긴 서술)
- 기록별 AI 코멘트 (강점/문제점/조언)
- 맞춤 명언 카드 + 한국어 번역 + 복사 + 이미지 저장 + 명언 저장
- 서비스 소개/만든 이유 문구를 관리자 페이지에서 직접 편집
- 개발자 소개 문구를 관리자 페이지에서 직접 편집
- 히어로 제목/부제/배지 문구를 관리자 페이지에서 직접 편집
- 별점 기반 리뷰 작성 및 목록 출력
- 관리자 페이지에서 리뷰 삭제/전체 정리
- 관리자 페이지에서 유료 이용 코드 발급 패널 제공
- 리뷰 작성자 전용 개발자 연락 버튼

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## OpenAI 설정

`.env.local` 파일을 만들고 아래를 추가하세요.

```bash
OPENAI_API_KEY=your_openai_api_key_here
ADMIN_PASSWORD=your_admin_password_here
ACCESS_CODE_SECRET=your_access_code_secret_here
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
```

`ACCESS_CODE_SECRET`은 유료 코드 서명/검증용 비밀값입니다.
`KV_REST_API_URL`, `KV_REST_API_TOKEN`을 설정하면 1회용 코드 사용 로그가 Vercel 배포 환경에서도 안정적으로 유지됩니다.

키가 없으면 API 라우트는 로컬 fallback 분석/명언을 반환합니다.
