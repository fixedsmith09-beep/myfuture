"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { QuoteResult } from "@/types/life";
import SectionCard from "./SectionCard";

interface QuoteCardProps {
  quote: QuoteResult | null;
  loading: boolean;
  onGenerate: () => void;
  onSave: () => void;
  disabled: boolean;
}

export default function QuoteCard({
  quote,
  loading,
  onGenerate,
  onSave,
  disabled,
}: QuoteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copyQuote = async () => {
    if (!quote) return;
    const text = `[현재 상태]\n${quote.currentState}\n\n[명언 원문]\n${quote.quote} — ${quote.person}\n\n[명언 번역]\n${quote.quoteKorean}\n\n[이유]\n${quote.reason}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveAsImage = async () => {
    if (!cardRef.current || !quote) return;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `life-quote-${Date.now()}.png`;
    anchor.click();
  };

  return (
    <SectionCard
      title="맞춤 명언 추천"
      subtitle="실존 인물의 실제 명언을 현재 흐름과 연결해 제공합니다."
    >
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-fuchsia-500 px-4 py-2.5 font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onGenerate}
          disabled={disabled || loading}
        >
          {loading ? "추천 중..." : "명언 받기"}
        </button>
        {quote ? (
          <button
            className="rounded-lg border border-zinc-600 px-4 py-2.5 font-semibold text-zinc-200 transition hover:border-zinc-400"
            onClick={onSave}
          >
            명언 저장
          </button>
        ) : null}
      </div>

      {quote ? (
        <div
          ref={cardRef}
          className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 text-sm text-zinc-300"
        >
          <p className="text-zinc-400">[현재 상태]</p>
          <p className="mt-1">{quote.currentState}</p>
          <p className="mt-4 text-zinc-400">[명언]</p>
          <blockquote className="mt-1 font-medium text-zinc-100">
            “{quote.quote}” — {quote.person}
          </blockquote>
          {quote.quoteKorean && quote.quoteKorean !== quote.quote ? (
            <>
              <p className="mt-3 text-zinc-400">[한국어 번역]</p>
              <blockquote className="mt-1 text-zinc-200">“{quote.quoteKorean}”</blockquote>
            </>
          ) : null}
          <p className="mt-4 text-zinc-400">[이유]</p>
          <p className="mt-1">{quote.reason}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">
          AI 분석을 진행한 뒤 명언을 생성하면 카드에 표시됩니다.
        </p>
      )}

      {quote ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-400"
            onClick={copyQuote}
          >
            {copied ? "복사 완료" : "복사"}
          </button>
          <button
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-400"
            onClick={saveAsImage}
          >
            이미지로 저장
          </button>
        </div>
      ) : null}
    </SectionCard>
  );
}
