"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AccessGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "코드 확인에 실패했습니다.");
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#09090b_45%)] pb-20 text-zinc-100">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Paid Access</p>
          <h1 className="mt-3 text-3xl font-bold">분석 서비스 코드 입력</h1>
          <p className="mt-2 text-sm text-zinc-300">
            관리자에게 받은 이용 코드를 입력하면 목표 분석 서비스를 사용할 수 있습니다.
          </p>
          <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
            <input
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="LGA1-XXXXX-XXXXX-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button
              className="rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "확인 중..." : "서비스 이용 시작"}
            </button>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </form>
          <Link href="/" className="mt-3 inline-block text-sm text-indigo-300 hover:text-indigo-200">
            메인으로 돌아가기
          </Link>
        </section>
      </main>
    </div>
  );
}
