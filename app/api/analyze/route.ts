import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { clamp } from "@/lib/life";
import { AnalysisResult, AnalyzeResponse, LifeEvent, ScoredLifeEvent } from "@/types/life";

const fallbackScore = (event: LifeEvent): ScoredLifeEvent => {
  let score = 0;
  if (event.type === "업적") score += 2;
  if (event.type === "문제") score -= 2;
  if (event.type === "전환점") score += 1;

  const text = `${event.title} ${event.description}`;
  if (event.age <= 16 && /(사업|창업|시작|첫)/.test(text)) score += 2;
  if (/(전재산|절반|손실|파산|빚)/.test(text)) score -= 3;
  if (/(회복|극복|재도전|재시작)/.test(text)) score += 2;

  const clamped = clamp(score, -5, 5);
  const aiStrength =
    clamped >= 3
      ? "나이와 상황 대비 실행력이 뛰어납니다. 같은 밀도의 행동을 유지하면 장기 경쟁력이 됩니다."
      : "의미 있는 판단을 시도한 기록입니다.";
  const aiRisk =
    clamped <= -3
      ? "손실 폭이 큰 선택입니다. 의사결정 전에 손실 상한을 설정하지 않은 점이 핵심 위험입니다."
      : "치명적 리스크는 아니지만, 결과 검증 루틴이 약한 편입니다.";
  const aiAdvice =
    clamped <= -3
      ? "다음부터는 투자/도전 전 '최대 손실 한도'와 '중단 조건'을 먼저 적고 시작하세요."
      : "후속 행동을 주간 단위로 기록해 결과를 숫자로 검증하세요.";

  return { ...event, score: clamped, aiStrength, aiRisk, aiAdvice };
};

const fallback = (lifeGoal: string, events: LifeEvent[]): AnalyzeResponse => {
  const scoredEvents = events.map(fallbackScore);
  const total = scoredEvents.reduce((acc, item) => acc + item.score, 0);
  const best = [...scoredEvents].sort((a, b) => b.score - a.score)[0];
  const worst = [...scoredEvents].sort((a, b) => a.score - b.score)[0];

  const analysis: AnalysisResult = {
    overallFlow: `목표 "${lifeGoal}"를 향해 ${events.length}개의 기록을 남겼고, 총점은 ${total}입니다. 초반 실행력은 좋지만, 일부 구간에서 리스크 관리가 약해 흔들렸습니다.`,
    strengthAnalysis: `가장 강한 강점은 ${best?.age ?? "-"}세의 "${best?.title ?? "-"}"에서 드러났습니다. 나이 대비 빠른 실행과 책임 감수 의지가 분명합니다.`,
    riskAnalysis: `가장 위험한 구간은 ${worst?.age ?? "-"}세의 "${worst?.title ?? "-"}"입니다. 손실 제어 장치 없이 큰 베팅을 한 점이 반복되면 성장 속도보다 회복 비용이 커집니다.`,
    patternAnalysis:
      "도전 자체는 빠르고 강하지만, 큰 손실을 막는 안전장치가 약한 패턴이 보입니다. 공격성과 방어력을 동시에 설계해야 장기적으로 유리합니다.",
    currentState:
      total >= 0
        ? "현재는 회복 가능성이 높은 상태입니다. 방향은 맞고, 관리 체계만 더 정밀해지면 됩니다."
        : "현재는 재정비가 필요한 상태입니다. 감정보다 시스템 중심으로 다시 설계해야 합니다.",
    practicalAdvice:
      "앞으로 모든 시도에 손실 상한(예: 자산의 5~10%)을 먼저 걸고, 주간 점검표로 실행 결과를 수치로 남기세요.",
    motivationLine:
      "당신은 이미 또래보다 먼저 움직인 사람이고, 이제는 그 실행력을 오래 버티게 만드는 단계에 들어왔습니다.",
  };

  return { analysis, scoredEvents, fallback: true };
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { lifeGoal?: string; events?: LifeEvent[] };
    const lifeGoal = body.lifeGoal?.trim() ?? "";
    const events = body.events ?? [];

    if (!lifeGoal) {
      return NextResponse.json({ error: "핵심 목표를 먼저 입력해주세요." }, { status: 400 });
    }

    if (events.length < 2) {
      return NextResponse.json(
        { error: "분석을 위해 최소 2개 기록이 필요합니다." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(fallback(lifeGoal, events));
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 냉정하지만 인간적인 코치다. 그래프/수치 중심 설명은 피하고, 사용자가 쓴 기록의 맥락과 나이를 보고 판단하라. 좋은 점은 구체적으로 칭찬하고, 위험한 기록은 현실적으로 조언하라. 과한 위로는 금지한다. 반드시 JSON으로만 답하라.",
        },
        {
          role: "user",
          content: JSON.stringify({
            lifeGoal,
            events,
            instruction: {
              scoredEvents:
                "각 기록마다 id를 그대로 넣고 score(-5~5 정수), aiStrength(2~4문장), aiRisk(2~4문장), aiAdvice(2~4문장)를 작성",
              overallFlow: "최소 6문장 이상의 전체 흐름 평가",
              strengthAnalysis: "핵심 강점 분석(최소 6문장)",
              riskAnalysis: "핵심 문제점 분석(최소 6문장)",
              patternAnalysis: "반복되는 강점/약점 패턴(최소 5문장)",
              currentState: "현재 상태 진단(최소 5문장)",
              practicalAdvice: "실행 가능한 현실 조언(최소 6문장)",
              motivationLine: "짧고 힘 있는 마무리",
            },
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(fallback(lifeGoal, events));
    }

    const parsed = JSON.parse(content) as {
      scoredEvents?: Array<{
        id: string;
        score: number;
        aiStrength: string;
        aiRisk: string;
        aiAdvice: string;
      }>;
      overallFlow: string;
      strengthAnalysis: string;
      riskAnalysis: string;
      patternAnalysis: string;
      currentState: string;
      practicalAdvice: string;
      motivationLine: string;
    };

    const scoreMap = new Map(
      (parsed.scoredEvents ?? []).map((item) => [
        item.id,
        {
          score: clamp(Number(item.score), -5, 5),
          aiStrength: item.aiStrength?.trim() || "강점 코멘트가 제공되지 않았습니다.",
          aiRisk: item.aiRisk?.trim() || "문제점 코멘트가 제공되지 않았습니다.",
          aiAdvice: item.aiAdvice?.trim() || "조언이 제공되지 않았습니다.",
        },
      ]),
    );

    const scoredEvents: ScoredLifeEvent[] = events.map((event) => {
      const scored = scoreMap.get(event.id);
      return {
        ...event,
        score: scored?.score ?? 0,
        aiStrength: scored?.aiStrength ?? "강점 코멘트가 제공되지 않았습니다.",
        aiRisk: scored?.aiRisk ?? "문제점 코멘트가 제공되지 않았습니다.",
        aiAdvice: scored?.aiAdvice ?? "조언이 제공되지 않았습니다.",
      };
    });

    const analysis: AnalysisResult = {
      overallFlow: parsed.overallFlow,
      strengthAnalysis: parsed.strengthAnalysis,
      riskAnalysis: parsed.riskAnalysis,
      patternAnalysis: parsed.patternAnalysis,
      currentState: parsed.currentState,
      practicalAdvice: parsed.practicalAdvice,
      motivationLine: parsed.motivationLine,
    };

    return NextResponse.json({ analysis, scoredEvents, fallback: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
