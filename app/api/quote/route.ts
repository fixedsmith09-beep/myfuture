import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { LifeEvent, QuoteResult, ScoredLifeEvent } from "@/types/life";

const fallbackQuotes: QuoteResult[] = [
  {
    currentState:
      "목표는 분명하지만 리스크 관리가 흔들리는 구간입니다. 실행 속도보다 손실 제어가 중요합니다.",
    quote:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
    quoteKorean:
      "당신이 통제할 수 있는 것은 마음뿐이며, 외부 사건이 아니다. 이 사실을 이해하면 힘을 얻을 수 있다.",
    person: "Marcus Aurelius",
  },
  {
    currentState:
      "실행력은 높지만 방향 검증 루틴이 약한 상태입니다. 작은 검증을 반복해 손실을 줄여야 합니다.",
    quote: "What gets measured gets managed.",
    quoteKorean: "측정되는 것은 관리된다.",
    person: "Peter Drucker",
  },
  {
    currentState:
      "빠르게 도전하는 장점이 명확합니다. 이제는 지속 가능한 속도로 시스템을 다듬는 단계입니다.",
    quote: "Slow is smooth, and smooth is fast.",
    quoteKorean: "느림은 매끄러움을 만들고, 매끄러움은 결국 빠름을 만든다.",
    person: "Navy SEALs saying",
  },
  {
    currentState: "의지는 강하지만 일관성이 흔들립니다. 작은 루틴을 고정해야 할 때입니다.",
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    quoteKorean: "우리는 반복적으로 하는 행동의 결과다. 탁월함은 행동이 아니라 습관이다.",
    person: "Aristotle",
  },
  {
    currentState: "불확실성 속에서도 전진하고 있습니다. 지금은 우선순위의 명확함이 필요합니다.",
    quote: "The main thing is to keep the main thing the main thing.",
    quoteKorean: "가장 중요한 것은 가장 중요한 것을 가장 중요하게 두는 것이다.",
    person: "Stephen Covey",
  },
  {
    currentState: "시작은 좋았지만 중간에 흐름이 끊깁니다. 완벽보다 완료가 먼저입니다.",
    quote: "Done is better than perfect.",
    quoteKorean: "완료는 완벽보다 낫다.",
    person: "Sheryl Sandberg",
  },
  {
    currentState: "방향은 맞지만 확신이 부족합니다. 행동으로 자신감을 만들어야 합니다.",
    quote: "Action is the foundational key to all success.",
    quoteKorean: "행동은 모든 성공의 기초 열쇠다.",
    person: "Pablo Picasso",
  },
  {
    currentState: "실수 이후 회복 속도가 중요해졌습니다. 지금은 재도전 근육을 키울 때입니다.",
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    quoteKorean: "성공은 끝이 아니고, 실패는 치명적이지 않다. 중요한 것은 계속할 용기다.",
    person: "Winston Churchill",
  },
  {
    currentState: "과부하가 쌓여 효율이 떨어지고 있습니다. 집중할 항목을 줄여야 합니다.",
    quote: "The essence of strategy is choosing what not to do.",
    quoteKorean: "전략의 본질은 하지 않을 것을 선택하는 데 있다.",
    person: "Michael Porter",
  },
  {
    currentState: "지속 가능한 성장을 만들 수 있는 구간입니다. 장기전 관점이 필요합니다.",
    quote: "Great things are not done by impulse, but by a series of small things brought together.",
    quoteKorean: "위대한 일은 충동으로 되지 않고, 작은 일들이 모여 이루어진다.",
    person: "Vincent van Gogh",
  },
  {
    currentState: "생각이 많아 실행이 늦어집니다. 작은 시작으로 관성을 만드는 게 우선입니다.",
    quote: "The secret of getting ahead is getting started.",
    quoteKorean: "앞서 나가는 비결은 시작하는 것이다.",
    person: "Mark Twain",
  },
  {
    currentState: "외부 평가에 흔들리고 있습니다. 기준을 내부로 되돌릴 시점입니다.",
    quote: "No one can make you feel inferior without your consent.",
    quoteKorean: "당신의 동의 없이는 누구도 당신을 열등하게 만들 수 없다.",
    person: "Eleanor Roosevelt",
  },
  {
    currentState: "막연함이 줄고 구조가 잡히기 시작했습니다. 꾸준함이 결과를 만듭니다.",
    quote: "It does not matter how slowly you go as long as you do not stop.",
    quoteKorean: "멈추지 않는다면 얼마나 천천히 가는지는 중요하지 않다.",
    person: "Confucius",
  },
  {
    currentState: "과거 실수의 영향이 남아 있습니다. 학습으로 전환할 시간입니다.",
    quote: "Mistakes are always forgivable, if one has the courage to admit them.",
    quoteKorean: "실수는 인정할 용기가 있다면 언제나 용서될 수 있다.",
    person: "Bruce Lee",
  },
  {
    currentState: "여러 가능성 사이에서 갈등 중입니다. 선택과 집중이 필요합니다.",
    quote: "You can do anything, but not everything.",
    quoteKorean: "당신은 무엇이든 할 수 있지만, 모든 것을 할 수는 없다.",
    person: "David Allen",
  },
  {
    currentState: "성장 곡선이 완만해졌습니다. 기준을 한 단계 높여야 합니다.",
    quote: "What we fear doing most is usually what we most need to do.",
    quoteKorean: "우리가 가장 두려워하는 일이 대개 우리가 가장 해야 할 일이다.",
    person: "Tim Ferriss",
  },
  {
    currentState: "결정 피로가 누적되어 있습니다. 원칙 기반 의사결정이 필요합니다.",
    quote: "In preparing for battle I have always found that plans are useless, but planning is indispensable.",
    quoteKorean: "전투를 준비하며 항상 느낀 건, 계획은 쓸모없을 수 있어도 계획하는 과정은 필수라는 점이다.",
    person: "Dwight D. Eisenhower",
  },
  {
    currentState: "작은 성공이 쌓이고 있습니다. 지금은 반복 가능성을 높여야 합니다.",
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    quoteKorean: "성공은 작은 노력이 매일 반복되어 만들어진 합이다.",
    person: "Robert Collier",
  },
  {
    currentState: "비교로 에너지가 빠지고 있습니다. 내 속도로 가는 힘이 필요합니다.",
    quote: "The only person you are destined to become is the person you decide to be.",
    quoteKorean: "당신이 결국 될 사람은 당신이 스스로 선택한 사람이다.",
    person: "Ralph Waldo Emerson",
  },
  {
    currentState: "방향성은 선명합니다. 이제 실행 빈도를 높여야 성과가 붙습니다.",
    quote: "An ounce of action is worth a ton of theory.",
    quoteKorean: "조금의 행동이 수많은 이론보다 가치 있다.",
    person: "Friedrich Engels",
  },
  {
    currentState: "불안정한 구간을 지나고 있습니다. 버티는 힘이 곧 경쟁력입니다.",
    quote: "Fall seven times, stand up eight.",
    quoteKorean: "일곱 번 넘어져도 여덟 번 일어나라.",
    person: "Japanese proverb",
  },
  {
    currentState: "문제 인식이 빨라졌습니다. 지금은 해법 실행 속도를 맞춰야 합니다.",
    quote: "However difficult life may seem, there is always something you can do and succeed at.",
    quoteKorean: "인생이 아무리 어려워 보여도, 당신이 할 수 있고 성공할 수 있는 일은 언제나 있다.",
    person: "Stephen Hawking",
  },
  {
    currentState: "집중이 분산되기 쉬운 시기입니다. 핵심 과업 하나에 깊게 들어가야 합니다.",
    quote: "Concentrate all your thoughts upon the work at hand.",
    quoteKorean: "손에 든 일에 모든 생각을 집중하라.",
    person: "Alexander Graham Bell",
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

    const fallbackIndex = Math.floor(Math.random() * fallbackQuotes.length);
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.95,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "실존 인물의 실제로 널리 알려진 명언만 사용하라. 출력에서 이유는 절대 포함하지 말고, JSON으로만 답하라.",
        },
        {
          role: "user",
          content: JSON.stringify({
            outputFormat: {
              currentState: "현재 상태 정의",
              quote: "명언 문장 원문 또는 번역",
              quoteKorean: "명언이 영어/외국어라면 자연스러운 한국어 번역. 한국어 명언이면 원문과 동일하게 작성",
              person: "인물명",
            },
            lifeGoal,
            scoredEvents,
            analysisHint: body.analysisText ?? "",
            varietyNonce: Date.now(),
            randomPoolHint: fallbackQuotes.map((item) => `${item.quote} — ${item.person}`),
            preferredSeedQuote: fallbackQuotes[fallbackIndex].quote,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = content
      ? (JSON.parse(content) as Partial<QuoteResult>)
      : fallbackQuotes[fallbackIndex];
    const quote: QuoteResult = {
      currentState: parsed.currentState ?? fallbackQuotes[fallbackIndex].currentState,
      quote: parsed.quote ?? fallbackQuotes[fallbackIndex].quote,
      quoteKorean:
        parsed.quoteKorean ?? parsed.quote ?? fallbackQuotes[fallbackIndex].quoteKorean,
      person: parsed.person ?? fallbackQuotes[fallbackIndex].person,
    };
    return NextResponse.json({ quote, fallback: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
