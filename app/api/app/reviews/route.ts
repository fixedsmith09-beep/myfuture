import { NextRequest, NextResponse } from "next/server";
import { addReview, getReviews } from "@/lib/content-store";
import { Review } from "@/types/life";

export async function GET() {
  const reviews = await getReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { review?: Partial<Review> };
  const reviewInput = body.review;
  if (!reviewInput?.content?.trim()) {
    return NextResponse.json({ error: "리뷰 내용이 필요합니다." }, { status: 400 });
  }

  const review: Review = {
    id: crypto.randomUUID(),
    nickname: (reviewInput.nickname ?? "익명").trim() || "익명",
    rating: Math.min(5, Math.max(1, Number(reviewInput.rating ?? 5))),
    content: reviewInput.content.trim(),
    createdAt: new Date().toISOString(),
  };

  const reviews = await addReview(review);
  return NextResponse.json({ reviews });
}
