import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearReviews, removeReview } from "@/lib/content-store";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin-auth")?.value === "ok";
  if (!isAuthed) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as { action?: "delete" | "clear"; id?: string };
  if (body.action === "clear") {
    const reviews = await clearReviews();
    return NextResponse.json({ reviews });
  }
  if (body.action === "delete" && body.id) {
    const reviews = await removeReview(body.id);
    return NextResponse.json({ reviews });
  }

  return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
}
