import { NextResponse } from "next/server";

// API 서버 상태 확인 요청 처리
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
