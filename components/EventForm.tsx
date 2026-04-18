"use client";

import { FormEvent, useState } from "react";
import { EVENT_TYPES, EventType, LifeEvent } from "@/types/life";
import { clamp } from "@/lib/life";
import SectionCard from "./SectionCard";

interface EventFormProps {
  onAddEvent: (event: LifeEvent) => void;
}

const defaultValues = {
  age: 24,
  title: "",
  type: "문제" as EventType,
  description: "",
};

export default function EventForm({ onAddEvent }: EventFormProps) {
  const [form, setForm] = useState(defaultValues);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    onAddEvent({
      id: crypto.randomUUID(),
      age: clamp(form.age, 1, 100),
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      createdAt: new Date().toISOString(),
    });

    setForm((prev) => ({
      ...defaultValues,
      age: prev.age,
    }));
  };

  return (
    <SectionCard
      title="인생 기록 입력"
      subtitle="기록을 모두 입력한 뒤 AI가 나이와 맥락을 보고 점수를 채점합니다."
    >
      <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm text-zinc-300">
          나이
          <input
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
            type="number"
            min={1}
            max={100}
            value={form.age}
            onChange={(e) => setForm((prev) => ({ ...prev, age: Number(e.target.value) }))}
            required
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300">
          기록 제목
          <input
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
            placeholder="예: 첫 사업 시작, 코인 손실, 첫 수익 달성"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </label>

        <label className="grid gap-1 text-sm text-zinc-300 md:col-span-2">
          유형
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as EventType }))}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm text-zinc-300 md:col-span-2">
          설명
          <textarea
            className="min-h-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
            placeholder="어떤 일이었고, 목표 달성에 어떤 영향을 줬는지 구체적으로 적어주세요."
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-2 text-sm">
          <span className="text-zinc-300">점수 산정 방식</span>
          <span className="font-semibold text-indigo-300">AI 분석 시 자동 채점</span>
        </div>

        <button
          type="submit"
          className="md:col-span-2 rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.99]"
        >
          기록 추가
        </button>
      </form>
    </SectionCard>
  );
}
