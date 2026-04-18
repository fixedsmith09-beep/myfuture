"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import SectionCard from "@/components/SectionCard";
import { DEFAULT_SETTINGS } from "@/lib/storage";
import { AppContentSettings, Review } from "@/types/life";

const DAILY_QUOTES = [
  "기록하지 않으면 감정이 판단을 대신한다.",
  "빠른 실행보다 오래 가는 시스템이 더 강하다.",
  "오늘의 작은 검증이 내일의 큰 실패를 막는다.",
  "강점은 반복할 때 자산이 되고, 실수는 기록할 때 자산이 된다.",
  "불안은 방향을 잃었을 때 커지고, 계획이 생기면 작아진다.",
  "결정은 감정으로 해도, 검증은 반드시 숫자로 하라.",
  "행동이 쌓이면 자신감이 되고, 자신감이 쌓이면 방향이 선명해진다.",
  "완벽한 타이밍은 없고, 준비된 실행만 있다.",
  "한 번의 큰 결심보다 매일의 작은 반복이 더 강하다.",
  "비교는 속도를 늦추고, 기록은 속도를 높인다.",
  "포기하지 않는 사람은 결국 방법을 찾아낸다.",
  "지금 필요한 건 더 많은 계획이 아니라 첫 번째 실행이다.",
  "흔들릴수록 기준을 단순하게 잡아라.",
  "성장은 불편함을 통과한 시간만큼 남는다.",
  "불확실할수록 원칙이 당신을 지켜준다.",
  "빠른 선택보다 올바른 선택이 결국 더 빠르다.",
  "작은 성공을 가볍게 보지 마라, 방향이 맞다는 증거다.",
  "실패는 끝이 아니라 전략을 다시 짜라는 신호다.",
  "오늘의 집중 한 시간이 내일의 불안을 줄인다.",
  "버티는 힘은 재능이 아니라 습관에서 나온다.",
  "문제를 정확히 정의하면 해결은 이미 절반이다.",
  "꾸준함은 평범해 보이지만 가장 희소한 경쟁력이다.",
] as const;

export default function Home() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<AppContentSettings>(DEFAULT_SETTINGS);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);

  const dailyQuote = useMemo(() => {
    const key = new Date().toISOString().slice(0, 10);
    const hash = key.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return DAILY_QUOTES[hash % DAILY_QUOTES.length];
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [settingsRes, reviewsRes] = await Promise.all([
        fetch("/api/app/settings", { cache: "no-store" }),
        fetch("/api/app/reviews", { cache: "no-store" }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings ?? DEFAULT_SETTINGS);
      }
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(data.reviews ?? []);
      }
    };

    loadData();
  }, []);

  const verifyAndGoAnalyze = async () => {
    setAccessError("");
    setAccessLoading(true);
    const res = await fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: accessCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAccessError(data.error ?? "코드 확인에 실패했습니다.");
      setAccessLoading(false);
      return;
    }
    router.push("/analyze");
  };

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
          <button
            onClick={() => setShowCodeModal(true)}
            className="mt-6 inline-flex rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            분석 시작하기
          </button>
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(settings.donationAccount)}
            className="rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 transition hover:bg-amber-400"
          >
            후원 계좌 복사
          </button>
          <p className="text-sm text-zinc-300">{settings.donationAccount}</p>
          <button
            onClick={() => setShowCodeModal(true)}
            className="rounded-lg border border-zinc-600 px-4 py-2.5 font-semibold text-zinc-100 transition hover:border-zinc-400"
          >
            서비스 이용하기
          </button>
          <p className="self-center text-sm text-zinc-400">
            개발자와 개인적으로 고민과 목표에 대한 대화를 할 수 있습니다.
          </p>
        </div>

        {showCodeModal ? (
          <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-zinc-100">유료 이용 코드 입력</h3>
              <p className="mt-1 text-sm text-zinc-400">
                관리자에게 받은 코드를 입력하면 분석 서비스를 사용할 수 있습니다.
              </p>
              <input
                className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                placeholder="LGA1-XXXXX-XXXXX-XXXXX"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              {accessError ? <p className="mt-2 text-sm text-rose-300">{accessError}</p> : null}
              <div className="mt-4 flex gap-2">
                <button
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
                  onClick={verifyAndGoAnalyze}
                  disabled={accessLoading || !accessCode.trim()}
                >
                  {accessLoading ? "확인 중..." : "확인 후 시작"}
                </button>
                <button
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-400"
                  onClick={() => {
                    setShowCodeModal(false);
                    setAccessError("");
                    setAccessCode("");
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
