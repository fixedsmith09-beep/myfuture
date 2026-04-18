"use client";

import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "로그인에 실패했습니다.");
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81_0%,#09090b_45%)] pb-20 text-zinc-100">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 px-6 py-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Admin</p>
          <h1 className="mt-3 text-3xl font-bold">관리자 인증</h1>
          <p className="mt-2 text-sm text-zinc-300">비밀번호를 입력해야 관리자 페이지에 접근할 수 있습니다.</p>
          <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
            <input
              type="password"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="관리자 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              {loading ? "확인 중..." : "입장하기"}
            </button>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>
      </main>
    </div>
  );
}
