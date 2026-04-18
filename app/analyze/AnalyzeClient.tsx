"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import AnalysisCards from "@/components/AnalysisCards";
import EventForm from "@/components/EventForm";
import EventList from "@/components/EventList";
import QuoteCard from "@/components/QuoteCard";
import ReviewSection from "@/components/ReviewSection";
import SectionCard from "@/components/SectionCard";
import { buildCumulativePoints } from "@/lib/life";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/storage";
import {
  AppContentSettings,
  AnalysisResult,
  AnalyzeResponse,
  LifeEvent,
  QuoteResult,
  Review,
  ScoredLifeEvent,
} from "@/types/life";

const LifeChart = dynamic(() => import("@/components/LifeChart"), { ssr: false });

export default function AnalyzeClient() {
  const [events, setEvents] = useState<LifeEvent[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEYS.events);
    return raw ? (JSON.parse(raw) as LifeEvent[]) : [];
  });
  const [lifeGoal, setLifeGoal] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEYS.lifeGoal) ?? "";
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEYS.reviews);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  });
  const [savedQuotes, setSavedQuotes] = useState<QuoteResult[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEYS.savedQuotes);
    if (!raw) return [];
    return (JSON.parse(raw) as Array<Partial<QuoteResult>>).map((item) => ({
      currentState: item.currentState ?? "",
      quote: item.quote ?? "",
      quoteKorean: item.quoteKorean ?? item.quote ?? "",
      reason: item.reason ?? "",
      person: item.person ?? "",
    }));
  });
  const [settings, setSettings] = useState<AppContentSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(STORAGE_KEYS.appSettings);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppContentSettings> & { donationUrl?: string };
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      donationAccount:
        parsed.donationAccount ?? parsed.donationUrl ?? DEFAULT_SETTINGS.donationAccount,
    } as AppContentSettings;
  });
  const [scoredEvents, setScoredEvents] = useState<ScoredLifeEvent[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [showInsta, setShowInsta] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lifeGoal, lifeGoal);
  }, [lifeGoal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.savedQuotes, JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  const points = useMemo(() => buildCumulativePoints(scoredEvents), [scoredEvents]);
  const hasReviewed = reviews.length > 0;

  useEffect(() => {
    const syncSettings = () => {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.appSettings);
      if (!rawSettings) {
        setSettings(DEFAULT_SETTINGS);
      } else {
        const parsed = JSON.parse(rawSettings) as Partial<AppContentSettings> & { donationUrl?: string };
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          donationAccount:
            parsed.donationAccount ?? parsed.donationUrl ?? DEFAULT_SETTINGS.donationAccount,
        });
      }
      const rawReviews = localStorage.getItem(STORAGE_KEYS.reviews);
      if (rawReviews) setReviews(JSON.parse(rawReviews));
    };

    window.addEventListener("storage", syncSettings);
    return () => window.removeEventListener("storage", syncSettings);
  }, []);

  const callAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setMessage("");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifeGoal, events }),
      });
      const data = (await res.json()) as AnalyzeResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "분석 실패");
      setAnalysis(data.analysis);
      setScoredEvents(data.scoredEvents);
      if (data.fallback) {
        setMessage("OpenAI API 키가 없어 로컬 분석 로직으로 결과를 생성했습니다.");
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "오류가 발생했습니다.";
      setMessage(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const callQuote = async () => {
    try {
      setIsQuoting(true);
      setMessage("");
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifeGoal,
          events,
          scoredEvents,
          analysisText: analysis
            ? Object.values(analysis)
                .filter(Boolean)
                .join("\n")
            : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "명언 추천 실패");
      setQuote(data.quote);
      if (data.fallback) {
        setMessage("OpenAI API 키가 없어 기본 명언 세트를 표시했습니다.");
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "오류가 발생했습니다.";
      setMessage(text);
    } finally {
      setIsQuoting(false);
    }
  };

  const saveCurrentQuote = () => {
    if (!quote) return;
    setSavedQuotes((prev) => [quote, ...prev].slice(0, 10));
    setMessage("명언이 저장되었습니다.");
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#09090b_45%)] pb-20 text-zinc-100">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-8">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-12 text-center shadow-2xl md:px-12">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Life Graph AI</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">목표 분석</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
              화면을 준비 중입니다...
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#09090b_45%)] pb-20 text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-8">
        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-12 text-center shadow-2xl md:px-12">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Life Graph AI</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">목표 분석</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
            기록을 입력하고 AI 분석을 실행해 강점, 문제점, 현실 조언을 구체적으로 확인하세요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-zinc-300">
            <Link href="/" className="rounded-full border border-zinc-700 px-3 py-1 hover:border-indigo-400">
              메인 홈
            </Link>
            <Link href="/admin" className="rounded-full border border-zinc-700 px-3 py-1 hover:border-indigo-400">
              관리자 페이지
            </Link>
          </div>
        </section>

        <SectionCard
          title="내 인생의 핵심 목표"
          subtitle="한 번만 적어두면, 이후 모든 기록은 이 목표와의 관계로 해석됩니다."
        >
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
            placeholder="예: 35세 이전에 내 사업으로 월 1천만원 순이익 만들기"
            value={lifeGoal}
            onChange={(e) => {
              setLifeGoal(e.target.value);
              setAnalysis(null);
              setQuote(null);
              setScoredEvents([]);
            }}
          />
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <EventForm
            onAddEvent={(event) => {
              setEvents((prev) => [...prev, event]);
              setAnalysis(null);
              setQuote(null);
              setScoredEvents([]);
            }}
          />
          <EventList
            events={events}
            scoredEvents={scoredEvents}
            onRemove={(id) => {
              setEvents((prev) => prev.filter((event) => event.id !== id));
              setAnalysis(null);
              setQuote(null);
              setScoredEvents([]);
            }}
          />
        </div>

        <LifeChart points={points} />

        <AnalysisCards
          analysis={analysis}
          loading={isAnalyzing}
          onAnalyze={callAnalyze}
          disabled={events.length < 2 || !lifeGoal.trim()}
        />

        <QuoteCard
          quote={quote}
          loading={isQuoting}
          onGenerate={callQuote}
          onSave={saveCurrentQuote}
          disabled={events.length < 2 || !analysis}
        />

        {savedQuotes.length > 0 ? (
          <SectionCard title="저장된 명언">
            <div className="grid gap-3 md:grid-cols-2">
              {savedQuotes.map((item, index) => (
                <article key={`${item.person}-${index}`} className="rounded-xl border border-zinc-800 p-4">
                  <p className="text-sm text-zinc-300">“{item.quote}”</p>
                  {item.quoteKorean && item.quoteKorean !== item.quote ? (
                    <p className="mt-1 text-xs text-zinc-400">번역: “{item.quoteKorean}”</p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-400">- {item.person}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(settings.donationAccount)}
            className="rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 transition hover:bg-amber-400"
          >
            후원 계좌 복사
          </button>
          <p className="text-sm text-zinc-300">{settings.donationAccount}</p>
          <button
            className="rounded-lg border border-zinc-600 px-4 py-2.5 font-semibold text-zinc-100 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!hasReviewed}
            onClick={() => setShowInsta((prev) => !prev)}
          >
            개발자와 대화하기
          </button>
          {!hasReviewed ? (
            <p className="self-center text-sm text-zinc-400">
              리뷰를 작성한 사용자만 개발자 연락 기능을 사용할 수 있습니다. 개발자와 개인적으로 고민과 목표에 대한 대화를 할 수 있습니다.
            </p>
          ) : null}
        </div>

        {showInsta && hasReviewed ? (
          <SectionCard title="개발자 인스타그램">
            <p className="text-zinc-200">{settings.instagramId}</p>
          </SectionCard>
        ) : null}

        <ReviewSection reviews={reviews} onAddReview={(review) => setReviews((prev) => [...prev, review])} />

        {message ? (
          <p className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
            {message}
          </p>
        ) : null}
      </main>
    </div>
  );
}
