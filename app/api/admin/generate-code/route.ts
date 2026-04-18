import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateOneTimeAccessCodes } from "@/lib/access-code";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin-auth")?.value === "ok";

  if (!isAuthed) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as { count?: number; validDays?: number };
  const count = Math.min(50, Math.max(1, Number(body.count ?? 1)));
  const validDays = Math.min(365, Math.max(1, Number(body.validDays ?? 30)));

  const codes = await generateOneTimeAccessCodes(count, validDays);
  return NextResponse.json({ codes, validDays });
}
