import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/status → 서버 상태 확인
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

// POST /api/status → MongoDB 연결 상태 확인
export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();
    return NextResponse.json({
      status: "ok",
      database: db.databaseName,
      message: "MongoDB 연결 성공",
    });
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "MongoDB 연결 실패",
      },
      { status: 500 }
    );
  }
}
