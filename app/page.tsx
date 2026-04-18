"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import SectionCard from "@/components/SectionCard";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/storage";
import { AppContentSettings, Review } from "@/types/life";

const DAILY_QUOTES = [
  "기록하지 않으면 감정이 판단을 대신한다.",
  "빠른 실행보다 오래 가는 시스템이 더 강하다.",
  "오늘의 작은 검증이 내일의 큰 실패를 막는다.",
  "강점은 반복할 때 자산이 되고, 실수는 기록할 때 자산이 된다.",
  "불안은 방향을 잃었을 때 커지고, 계획이 생기면 작아진다.",
  "결정은 감정으로 해도, 검증은 반드시 숫자로 하라.",
] as const;

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEYS.reviews);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  });
  const [settings, setSettings] = useState<AppContentSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(STORAGE_KEYS.appSettings);
    return raw ? ({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppContentSettings) : DEFAULT_SETTINGS;
  });
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const dailyQuote = useMemo(() => {
    const key = new Date().toISOString().slice(0, 10);
    const hash = key.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return DAILY_QUOTES[hash % DAILY_QUOTES.length];
  }, []);

  useEffect(() => {
    const sync = () => {
      const rawSettings = localStorage.getItem(STORAGE_KEYS.appSettings);
      setSettings(rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS);
      const rawReviews = localStorage.getItem(STORAGE_KEYS.reviews);
      setReviews(rawReviews ? JSON.parse(rawReviews) : []);
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#09090b_45%)] pb-20 text-zinc-100">
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-8">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-12 text-center shadow-2xl md:px-12">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">{DEFAULT_SETTINGS.heroEyebrow}</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              {DEFAULT_SETTINGS.heroTitle}
            </h1>
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
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">{settings.heroEyebrow}</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
            {settings.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
            {settings.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-zinc-300">
            <span className="rounded-full border border-zinc-700 px-3 py-1">{settings.heroBadgeDarkMode}</span>
            <span className="rounded-full border border-zinc-700 px-3 py-1">{settings.heroBadgeMobile}</span>
            <span className="rounded-full border border-zinc-700 px-3 py-1">{settings.heroBadgeAi}</span>
            <Link href="/admin" className="rounded-full border border-zinc-700 px-3 py-1 hover:border-indigo-400">
              {settings.heroBadgeAdmin}
            </Link>
          </div>
          <blockquote className="mx-auto mt-6 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200">
            오늘의 한마디: &ldquo;{dailyQuote}&rdquo;
          </blockquote>
          <Link
            href="/analyze"
            className="mt-6 inline-flex rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            분석 시작하기
          </Link>
        </section>

        <SectionCard title="사용자 리뷰">
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-400">아직 등록된 리뷰가 없습니다.</p>
            ) : (
              reviews
                .slice()
                .reverse()
                .slice(0, 6)
                .map((review) => (
                  <article key={review.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-200">{review.nickname}</p>
                      <p className="text-amber-300 text-sm">{"★".repeat(review.rating)}</p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{review.content}</p>
                  </article>
                ))
            )}
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="서비스 설명">
            <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{settings.serviceDescription}</p>
          </SectionCard>
          <SectionCard title="만든 이유">
            <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{settings.makerReason}</p>
          </SectionCard>
        </div>

        <SectionCard title="개발자 소개">
          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{settings.developerIntro}</p>
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <a
            href={settings.donationUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 transition hover:bg-amber-400"
          >
            후원하기
          </a>
          <Link
            href="/analyze"
            className="rounded-lg border border-zinc-600 px-4 py-2.5 font-semibold text-zinc-100 transition hover:border-zinc-400"
          >
            서비스 이용하기
          </Link>
          <p className="self-center text-sm text-zinc-400">
            개발자와 개인적으로 고민과 목표에 대한 대화를 할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
