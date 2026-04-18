import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSettings, updateSettings } from "@/lib/content-store";
import { AppContentSettings } from "@/types/life";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin-auth")?.value === "ok";
  if (!isAuthed) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json()) as { settings?: Partial<AppContentSettings> };
  const next = await updateSettings(body.settings ?? {});
  return NextResponse.json({ settings: next });
}
