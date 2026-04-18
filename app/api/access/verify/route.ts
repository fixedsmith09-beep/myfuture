import { NextRequest, NextResponse } from "next/server";
import { consumeOneTimeAccessCode } from "@/lib/access-code";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { code?: string };
  const code = body.code?.trim() ?? "";
  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (!code) {
    return NextResponse.json({ error: "코드를 입력해주세요." }, { status: 400 });
  }

  const verified = await consumeOneTimeAccessCode(code, { ip, userAgent });
  if (!verified.ok) {
    return NextResponse.json({ error: "유효하지 않거나 만료된 코드입니다." }, { status: 401 });
  }

  const maxAge = Math.max(60, Math.floor((verified.exp - Date.now()) / 1000));
  const res = NextResponse.json({ ok: true });
  res.cookies.set("paid-access", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return res;
}
