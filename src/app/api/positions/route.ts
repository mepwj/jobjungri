import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/positions - 저장된 직무 목록 조회
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // jobPostings 컬렉션에서 고유한 position 값들을 가져옴
    const positions = await db.collection("jobPostings")
      .aggregate([
        { $group: { _id: "$position" } },
        { $match: { _id: { $ne: "내용 없음" } } }, // "내용 없음" 값은 제외
        { $sort: { _id: 1 } } // 알파벳 순으로 정렬
      ])
      .toArray();
    
    // _id 필드를 일반 문자열 배열로 변환
    const positionList = positions.map(item => item._id);
    
    return NextResponse.json(positionList);
  } catch (error) {
    console.error("직무 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "직무 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
