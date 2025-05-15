import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import OpenAI from "openai";

// OpenAI API 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();
    const { position, experience } = body;

    if (!position || !experience) {
      return NextResponse.json(
        { error: "직무와 년차가 모두 필요합니다." },
        { status: 400 }
      );
    }

    // 캐시된 데이터 확인
    const cachedData = await db.collection("skillsPreparation").findOne({
      position,
      experience,
    });

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // 해당 직무와 년차에 맞는 채용공고 가져오기
    let jobPostings = await db.collection("jobPostings").find({
      position: position,
      experience: experience,
    }).limit(5).toArray();

    // 채용공고가 부족하면 년차 조건 완화
    if (jobPostings.length < 2) {
      jobPostings = await db.collection("jobPostings").find({
        position: position,
      }).limit(5).toArray();
    }

    // GPT를 이용해 준비사항 분석
    const skillsData = await analyzeSkillsNeeded(position, experience, jobPostings);

    // 분석 결과 DB에 캐시
    await db.collection("skillsPreparation").insertOne({
      position,
      experience,
      ...skillsData,
      createdAt: new Date(),
    });

    return NextResponse.json(skillsData);
  } catch (error) {
    console.error("준비사항 분석 오류:", error);
    return NextResponse.json(
      { error: "준비사항 분석에 실패했습니다." },
      { status: 500 }
    );
  }
}

async function analyzeSkillsNeeded(position: string, experience: string, jobPostings: any[]) {
  // 실제 채용공고 데이터 추출
  const jobPostingsText = jobPostings.map(posting => {
    return `
회사: ${posting.company}
기술스택: ${posting.techStack.join(', ')}
우대사항: ${posting.preferredSkills.join(', ')}
`;
  }).join("\n---\n");

  const prompt = `
당신은 ${position} 직무 분야의 채용 및 커리어 전문가입니다. ${experience} 경력의 사람이 이 직무에 필요한 준비사항을 알려주세요.

다음은 실제 채용공고 데이터입니다:
${jobPostingsText || "관련 채용공고 데이터가 충분하지 않습니다."}

위 데이터를 바탕으로 ${position} (${experience}) 지원자에게 필요한 정보를 다음 JSON 형식으로 제공해주세요:

{
  "essentialSkills": ["필수 기술스택 1", "필수 기술스택 2", ...], // 5-8개 항목
  "bonusSkills": ["우대 기술/역량 1", "우대 기술/역량 2", ...], // 5-8개 항목
  "recommendations": ["준비 방법 및 추천 자료에 대한 구체적인 조언 1", "조언 2", ...] // 3-5개 항목
}

채용공고 데이터가 불충분한 경우, 해당 직무에 대한 일반적인 지식을 바탕으로 답변해주세요.
`;

  // ChatGPT에게 분석 요청
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // 더 빠르고 비용 효율적인 모델 사용
    messages: [
      {
        role: "system",
        content: "당신은 채용 및 커리어 전문가입니다. 직무별 필요 역량과 준비 방법에 대해 구체적이고 실용적인 조언을 제공합니다."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  // 응답 파싱
  try {
    const content = response.choices[0].message.content || "{}";
    const parsedData = JSON.parse(content);
    
    // 기본 데이터 구조 확인
    const defaultData = {
      essentialSkills: ["관련 데이터가 부족합니다."],
      bonusSkills: ["관련 데이터가 부족합니다."],
      recommendations: ["충분한 채용공고 데이터가 없어 정확한 분석이 어렵습니다."]
    };
    
    return {
      ...defaultData,
      ...parsedData,
    };
  } catch (error) {
    console.error("GPT 응답 파싱 오류:", error);
    return {
      essentialSkills: ["데이터 분석 중 오류가 발생했습니다."],
      bonusSkills: ["데이터 분석 중 오류가 발생했습니다."],
      recommendations: ["잠시 후 다시 시도해주세요."]
    };
  }
}
