import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { LifeEvent, QuoteResult, ScoredLifeEvent } from "@/types/life";

const fallbackQuotes: QuoteResult[] = [
  {
    currentState:
      "목표는 분명하지만 리스크 관리가 흔들리는 구간입니다. 실행은 빠르지만 회복 비용이 큰 선택을 줄여야 합니다.",
    quote:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
    quoteKorean:
      "당신이 통제할 수 있는 것은 마음뿐이며, 외부 사건이 아니다. 이 사실을 이해하면 힘을 얻을 수 있다.",
    person: "Marcus Aurelius",
    reason:
      "외부 상황보다 통제 가능한 행동에 집중하라는 메시지가 현재의 불확실성을 줄이는 데 직접적이기 때문입니다.",
  },
  {
    currentState:
      "실행력은 높지만 방향 검증 루틴이 약한 상태입니다. 작은 검증을 반복해 손실을 줄여야 합니다.",
    quote: "What gets measured gets managed.",
    quoteKorean: "측정되는 것은 관리된다.",
    person: "Peter Drucker",
    reason:
      "현재는 감정적 판단보다 지표 기반 점검이 중요하므로, 측정 습관을 만드는 문장이 가장 실용적입니다.",
  },
  {
    currentState:
      "빠르게 도전하는 장점이 명확합니다. 이제는 지속 가능한 속도로 시스템을 다듬는 단계입니다.",
    quote: "Slow is smooth, and smooth is fast.",
    quoteKorean: "느림은 매끄러움을 만들고, 매끄러움은 결국 빠름을 만든다.",
    person: "Navy SEALs saying",
    reason:
      "지금은 무리한 속도보다 재현 가능한 실행 체계를 만드는 것이 장기 성과에 더 유리하기 때문입니다.",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      lifeGoal?: string;
      events?: LifeEvent[];
      scoredEvents?: ScoredLifeEvent[];
      analysisText?: string;
    };
    const lifeGoal = body.lifeGoal?.trim() ?? "";
    const events = body.events ?? [];
    const scoredEvents = body.scoredEvents ?? [];

    if (events.length < 2) {
      return NextResponse.json(
        { error: "명언 추천을 위해 최소 2개 기록이 필요합니다." },
        { status: 400 },
      );
    }

    if (!lifeGoal) {
      return NextResponse.json({ error: "핵심 목표를 먼저 입력해주세요." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      const selected = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      return NextResponse.json({ quote: selected, fallback: true });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "실존 인물의 실제로 널리 알려진 명언만 사용하라. 과장하지 말고 한국어로 현실적인 설명을 작성하라. 같은 입력이어도 매번 다른 명언 후보를 우선 선택하라. JSON으로만 답하라.",
        },
        {
          role: "user",
          content: JSON.stringify({
            outputFormat: {
              currentState: "현재 상태 정의",
              quote: "명언 문장 원문 또는 번역",
              quoteKorean: "명언이 영어/외국어라면 자연스러운 한국어 번역. 한국어 명언이면 원문과 동일하게 작성",
              person: "인물명",
              reason: "왜 맞는지 현실적인 설명",
            },
            lifeGoal,
            scoredEvents,
            analysisHint: body.analysisText ?? "",
            varietyNonce: Date.now(),
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = content
      ? (JSON.parse(content) as Partial<QuoteResult>)
      : fallbackQuotes[0];
    const quote: QuoteResult = {
      currentState: parsed.currentState ?? fallbackQuotes[0].currentState,
      quote: parsed.quote ?? fallbackQuotes[0].quote,
      quoteKorean: parsed.quoteKorean ?? parsed.quote ?? fallbackQuotes[0].quoteKorean,
      person: parsed.person ?? fallbackQuotes[0].person,
      reason: parsed.reason ?? fallbackQuotes[0].reason,
    };
    return NextResponse.json({ quote, fallback: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
