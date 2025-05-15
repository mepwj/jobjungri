import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import OpenAI from "openai";

// OpenAI API 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/job-posting - 채용공고 분석 및 저장
export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();
    const { jobPostingText } = body;

    if (!jobPostingText) {
      return NextResponse.json(
        { error: "채용공고 텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    // OpenAI API를 사용하여 채용공고 텍스트 분석
    const structuredData = await analyzeJobPosting(jobPostingText);

    // 분석된 데이터를 DB에 저장
    const result = await db.collection("jobPostings").insertOne(structuredData);

    return NextResponse.json({
      message: "채용공고가 분석되어 저장되었습니다.",
      data: structuredData,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("채용공고 처리 오류:", error);
    return NextResponse.json(
      { error: "채용공고 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET /api/job-posting - 저장된 채용공고 조회
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const position = searchParams.get("position");
    const experience = searchParams.get("experience");

    // ID로 특정 채용공고 조회
    if (id) {
      const { ObjectId } = await import("mongodb");
      const jobPosting = await db
        .collection("jobPostings")
        .findOne({ _id: new ObjectId(id) });
      
      if (!jobPosting) {
        return NextResponse.json({ error: "해당 ID의 채용공고를 찾을 수 없습니다." }, { status: 404 });
      }
      
      return NextResponse.json({
        id: jobPosting._id.toString(),
        ...jobPosting,
      });
    }

    // 직무와 경력으로 필터링
    let query: any = {};
    if (position) query.position = position;
    if (experience) {
      // 경력 관련 패턴 매칭 - 정확한 문자열 일치나 정규표현식 사용
      query.experience = experience;
    }

    const jobPostings = await db.collection("jobPostings").find(query).toArray();
    const result = jobPostings.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("채용공고 조회 오류:", error);
    return NextResponse.json(
      { error: "채용공고 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// OpenAI API를 사용해 채용공고 텍스트 분석
async function analyzeJobPosting(jobPostingText: string) {
  const prompt = `
다음 채용공고 텍스트를 분석하여 JSON 형태로 정리해주세요. 다른 설명은 필요없고 JSON만 반환해주세요.
JSON 구조는 다음과 같습니다:
{
  "company": "회사명",
  "position": "직무",
  "experience": "년차",
  "techStack": ["기술스택1", "기술스택2", ...],
  "preferredSkills": ["우대사항1", "우대사항2", ...]
}

각 필드에 해당하는 정보가 없거나 명확하지 않은 경우 "내용 없음"으로 표시해주세요.
기술 스택과 우대사항은 배열 형태로 반환해주세요.

년차(경력)의 경우 다음 카테고리 중 하나로 표준화해서 반환해주세요:
- "신입"
- "1~3년"
- "3~5년"
- "5~7년"
- "7~10년"
- "10년 이상"

만약 무관 및 경력사항이 있는 경우 "경력 무관"으로 표시해주세요.

채용공고 텍스트:
${jobPostingText}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",  // GPT-4o mini 모델 사용
    messages: [
      {
        role: "system",
        content: "채용공고를 분석하여 구조화된 JSON 형태로 변환하는 비서입니다."
      },
      {
        role: "user", 
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  // JSON 문자열을 파싱하여 객체로 변환
  try {
    const content = response.choices[0].message.content || "{}";
    const parsedData = JSON.parse(content);
    
    // 필수 필드가 없는 경우 "내용 없음"으로 설정
    const defaultData = {
      company: "내용 없음",
      position: "내용 없음",
      experience: "내용 없음",
      techStack: ["내용 없음"],
      preferredSkills: ["내용 없음"]
    };
    
    return {
      ...defaultData,
      ...parsedData,
      originalText: jobPostingText,
      createdAt: new Date()
    };
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    throw new Error("ChatGPT 응답을 JSON으로 파싱하는데 실패했습니다.");
  }
}

// DELETE /api/job-posting - 채용공고 삭제
export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "삭제할 채용공고 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const { ObjectId } = await import("mongodb");
    const result = await db
      .collection("jobPostings")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "해당 ID의 채용공고가 존재하지 않습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "채용공고가 삭제되었습니다.",
      deletedId: id,
    });
  } catch (error) {
    console.error("채용공고 삭제 오류:", error);
    return NextResponse.json(
      { error: "채용공고 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}