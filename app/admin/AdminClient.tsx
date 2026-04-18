"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import SectionCard from "@/components/SectionCard";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/storage";
import { AppContentSettings, Review } from "@/types/life";

type AccessLogEntry = {
  usedAt: number;
  ip: string;
  userAgent: string;
  codeTail: string;
};

export default function AdminClient() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [settings, setSettings] = useState<AppContentSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(STORAGE_KEYS.appSettings);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEYS.reviews);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  });
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(1);
  const [validDays, setValidDays] = useState(30);
  const [codes, setCodes] = useState<string[]>([]);
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEYS.appSettings, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  const deleteReview = (id: string) => {
    const next = reviews.filter((review) => review.id !== id);
    setReviews(next);
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(next));
  };

  const clearReviews = () => {
    setReviews([]);
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify([]));
  };

  const generateCodes = async () => {
    setCodeError("");
    setCodeLoading(true);
    const res = await fetch("/api/admin/generate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count, validDays }),
    });

    const data = await res.json();
    if (!res.ok) {
      setCodeError(data.error ?? "코드 생성에 실패했습니다.");
      setCodeLoading(false);
      return;
    }

    setCodes(data.codes ?? []);
    setCodeLoading(false);
  };

  const copyCodes = async () => {
    if (codes.length === 0) return;
    await navigator.clipboard.writeText(codes.join("\n"));
  };

  const loadLogs = async () => {
    setLogLoading(true);
    const res = await fetch("/api/admin/access-logs");
    const data = await res.json();
    if (res.ok) {
      setLogs(data.logs ?? []);
    }
    setLogLoading(false);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81_0%,#09090b_45%)] pb-20 text-zinc-100">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 md:px-8">
          <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-8 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Admin</p>
            <h1 className="mt-3 text-3xl font-bold">서비스 관리 페이지</h1>
            <p className="mt-2 text-sm text-zinc-300">화면을 준비 중입니다...</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81_0%,#09090b_45%)] pb-20 text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 md:px-8">
        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Admin</p>
          <h1 className="mt-3 text-3xl font-bold">서비스 관리 페이지</h1>
          <p className="mt-2 text-sm text-zinc-300">
            히어로 문구, 서비스 설명, 만든 이유, 연락/후원 링크, 리뷰 목록을 개발자가 직접 관리할 수 있습니다.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/" className="text-sm text-indigo-300 hover:text-indigo-200">
              메인으로 돌아가기
            </Link>
            <button className="text-sm text-rose-300 hover:text-rose-200" onClick={logout}>
              로그아웃
            </button>
          </div>
        </section>

        <SectionCard title="히어로 영역 관리" subtitle="메인 첫 화면의 제목/부제/배지 문구를 수정합니다.">
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm text-zinc-300">
              상단 라벨
              <input
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.heroEyebrow}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroEyebrow: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              메인 제목
              <input
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.heroTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroTitle: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              메인 부제
              <textarea
                className="min-h-20 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.heroSubtitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm text-zinc-300">
                배지 1
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  value={settings.heroBadgeDarkMode}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heroBadgeDarkMode: e.target.value }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm text-zinc-300">
                배지 2
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  value={settings.heroBadgeMobile}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heroBadgeMobile: e.target.value }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm text-zinc-300">
                배지 3
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  value={settings.heroBadgeAi}
                  onChange={(e) => setSettings((prev) => ({ ...prev, heroBadgeAi: e.target.value }))}
                />
              </label>
              <label className="grid gap-1 text-sm text-zinc-300">
                관리자 링크 라벨
                <input
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                  value={settings.heroBadgeAdmin}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, heroBadgeAdmin: e.target.value }))
                  }
                />
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="콘텐츠 관리" subtitle="메인 화면의 설명 문구를 수정하세요.">
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm text-zinc-300">
              서비스 설명
              <textarea
                className="min-h-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.serviceDescription}
                onChange={(e) => setSettings((prev) => ({ ...prev, serviceDescription: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              만든 이유
              <textarea
                className="min-h-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.makerReason}
                onChange={(e) => setSettings((prev) => ({ ...prev, makerReason: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              개발자 소개
              <textarea
                className="min-h-20 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.developerIntro}
                onChange={(e) => setSettings((prev) => ({ ...prev, developerIntro: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              인스타 아이디
              <input
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.instagramId}
                onChange={(e) => setSettings((prev) => ({ ...prev, instagramId: e.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              후원 링크
              <input
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={settings.donationUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, donationUrl: e.target.value }))}
              />
            </label>
            <button
              onClick={saveSettings}
              className="rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
            >
              저장
            </button>
            {saved ? <p className="text-sm text-emerald-300">저장되었습니다.</p> : null}
          </div>
        </SectionCard>

        <SectionCard title="유료 이용 코드 발급" subtitle="생성한 코드는 1회용이며, 사용 즉시 소멸됩니다.">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-zinc-300">
              발급 수량 (최대 50)
              <input
                type="number"
                min={1}
                max={50}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <label className="grid gap-1 text-sm text-zinc-300">
              유효 기간(일)
              <input
                type="number"
                min={1}
                max={365}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
              />
            </label>
            <button
              className="rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
              onClick={generateCodes}
              disabled={codeLoading}
            >
              {codeLoading ? "생성 중..." : "코드 생성"}
            </button>
            <button
              className="rounded-lg border border-zinc-600 px-4 py-2.5 font-semibold text-zinc-100 transition hover:border-zinc-400"
              onClick={copyCodes}
            >
              코드 전체 복사
            </button>
          </div>
          {codeError ? <p className="mt-2 text-sm text-rose-300">{codeError}</p> : null}
          {codes.length > 0 ? (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="mb-2 text-sm text-zinc-300">발급된 코드</p>
              <pre className="max-h-52 overflow-auto whitespace-pre-wrap text-xs text-zinc-400">
                {codes.join("\n")}
              </pre>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="코드 사용 로그" subtitle="최근 사용된 1회용 코드 기록입니다.">
          <div className="mb-3">
            <button
              onClick={loadLogs}
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-400"
            >
              {logLoading ? "불러오는 중..." : "로그 새로고침"}
            </button>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-400">아직 사용 로그가 없습니다.</p>
          ) : (
            <div className="grid gap-2">
              {logs.map((log, index) => (
                <article
                  key={`${log.usedAt}-${index}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300"
                >
                  <p>사용시각: {new Date(log.usedAt).toLocaleString("ko-KR")}</p>
                  <p>코드 식별: ****{log.codeTail}</p>
                  <p>IP: {log.ip}</p>
                  <p className="truncate">UA: {log.userAgent}</p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="리뷰 관리" subtitle="부적절한 리뷰 삭제나 전체 초기화를 할 수 있습니다.">
          <div className="mb-3">
            <button
              onClick={clearReviews}
              className="rounded-lg border border-rose-500/60 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            >
              리뷰 전체 삭제
            </button>
          </div>
          <div className="grid gap-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-400">관리할 리뷰가 없습니다.</p>
            ) : (
              reviews
                .slice()
                .reverse()
                .map((review) => (
                  <article key={review.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-200">{review.nickname}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-amber-300 text-sm">{"★".repeat(review.rating)}</p>
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="text-xs text-rose-300 hover:text-rose-200"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{review.content}</p>
                  </article>
                ))
            )}
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
