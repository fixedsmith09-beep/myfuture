"use client";

import { FormEvent, useState } from "react";
import { Review } from "@/types/life";
import SectionCard from "./SectionCard";

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

export default function ReviewSection({ reviews, onAddReview }: ReviewSectionProps) {
  const [nickname, setNickname] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;

    onAddReview({
      id: crypto.randomUUID(),
      nickname: nickname.trim() || "익명",
      rating,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    setNickname("");
    setRating(5);
    setContent("");
  };

  return (
    <SectionCard title="사용자 리뷰" subtitle="선택 작성 기능입니다. 리뷰는 로컬에 저장됩니다.">
      <form onSubmit={submitReview} className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-zinc-300">
          닉네임 (선택)
          <input
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <fieldset className="grid gap-1 text-sm text-zinc-300">
          <legend>별점</legend>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star}점`}
                onClick={() => setRating(star)}
                className={`text-xl transition ${
                  star <= rating ? "text-amber-300" : "text-zinc-600"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>
        <label className="md:col-span-2 grid gap-1 text-sm text-zinc-300">
          리뷰 내용
          <textarea
            className="min-h-20 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
            placeholder="서비스가 실제로 어떤 도움이 되었는지 적어주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>
        <button
          className="md:col-span-2 rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-white transition hover:bg-sky-400"
          type="submit"
        >
          리뷰 등록
        </button>
      </form>

      <div className="mt-4 grid gap-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-400">아직 등록된 리뷰가 없습니다.</p>
        ) : (
          reviews
            .slice()
            .reverse()
            .map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-zinc-200">{review.nickname}</p>
                  <p className="text-amber-300">{"★".repeat(review.rating)}</p>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{review.content}</p>
              </article>
            ))
        )}
      </div>
    </SectionCard>
  );
}
