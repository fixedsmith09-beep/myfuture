import { AnalysisResult } from "@/types/life";
import SectionCard from "./SectionCard";

interface AnalysisCardsProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  onAnalyze: () => void;
  disabled: boolean;
}

const labels: { key: keyof AnalysisResult; title: string }[] = [
  { key: "overallFlow", title: "1) 전체 흐름 종합" },
  { key: "strengthAnalysis", title: "2) 핵심 강점 분석" },
  { key: "riskAnalysis", title: "3) 핵심 문제점 분석" },
  { key: "patternAnalysis", title: "4) 반복 패턴 분석" },
  { key: "currentState", title: "5) 현재 상태 진단" },
  { key: "practicalAdvice", title: "6) 실행 조언" },
  { key: "motivationLine", title: "7) 마무리 한 문장" },
];

export default function AnalysisCards({
  analysis,
  loading,
  onAnalyze,
  disabled,
}: AnalysisCardsProps) {
  return (
    <SectionCard
      title="AI 인생 분석"
      subtitle="당신의 기록을 토대로 강점과 약점,문제점을 분석하여 현실적인 조언을 제공합니다."
    >
      <button
        className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onAnalyze}
        disabled={disabled || loading}
      >
        {loading ? "분석 중..." : "AI 분석 실행"}
      </button>

      {analysis ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {labels.map((item) => (
            <article
              key={item.key}
              className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-zinc-700"
            >
              <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {analysis[item.key]}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">
          핵심 목표와 최소 2개 기록을 입력한 뒤 분석을 실행하면 카드 형태로 결과가 나타납니다.
        </p>
      )}
    </SectionCard>
  );
}
