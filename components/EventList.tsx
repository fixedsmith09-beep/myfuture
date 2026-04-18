"use client";

import { sortEvents } from "@/lib/life";
import { LifeEvent, ScoredLifeEvent } from "@/types/life";
import SectionCard from "./SectionCard";

interface EventListProps {
  events: LifeEvent[];
  scoredEvents: ScoredLifeEvent[];
  onRemove: (id: string) => void;
}

export default function EventList({ events, scoredEvents, onRemove }: EventListProps) {
  const sorted = sortEvents(events);
  const scoreMap = new Map(scoredEvents.map((item) => [item.id, item]));

  return (
    <SectionCard
      title="기록 타임라인"
      subtitle="시간순으로 정렬되며 삭제 시 누적 점수도 즉시 갱신됩니다."
    >
      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-400">
          아직 입력된 기록이 없습니다. 첫 기록을 추가해 그래프를 시작하세요.
        </p>
      ) : (
        <ul className="grid gap-3">
          {sorted.map((event) => {
            const scored = scoreMap.get(event.id);
            return (
              <li
                key={event.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-zinc-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-zinc-100">
                    {event.age}세 · {event.title}
                  </p>
                  <button
                    className="text-xs text-zinc-400 transition hover:text-rose-300"
                    onClick={() => onRemove(event.id)}
                  >
                    삭제
                  </button>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{event.type}</p>
                <p className="mt-2 text-sm text-zinc-300">{event.description}</p>
                <div className="mt-3 flex gap-4 text-xs text-zinc-400">
                  <span>AI 점수: {scored?.score ?? "-"}</span>
                </div>
                {scored ? (
                  <div className="mt-3 grid gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs leading-relaxed">
                    <p className="text-emerald-300">강점: {scored.aiStrength}</p>
                    <p className="text-rose-300">문제점: {scored.aiRisk}</p>
                    <p className="text-sky-300">조언: {scored.aiAdvice}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-zinc-500">
                    분석을 실행하면 기록별 강점/문제점/조언이 상세히 표시됩니다.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
