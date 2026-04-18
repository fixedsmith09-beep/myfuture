import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listAccessLogs } from "@/lib/access-code";

export async function GET() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin-auth")?.value === "ok";
  if (!isAuthed) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const logs = await listAccessLogs();
  return NextResponse.json({ logs });
}
