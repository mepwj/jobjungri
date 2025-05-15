"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [positions, setPositions] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skillsData, setSkillsData] = useState<any>(null);
  const router = useRouter();

  // 직무 목록 가져오기
  useEffect(() => {
    async function fetchPositions() {
      try {
        const response = await fetch("/api/positions");
        if (response.ok) {
          const data = await response.json();
          setPositions(data);
        }
      } catch (err) {
        console.error("직무 목록 가져오기 오류:", err);
      }
    }

    fetchPositions();
  }, []);

  // 선택된 직무와 년차에 따른 준비사항 요청
  const handlePrepareSkills = async () => {
    if (!selectedPosition || !selectedExperience) {
      alert("직무와 년차를 모두 선택해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/prepare-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position: selectedPosition,
          experience: selectedExperience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSkillsData(data);
      } else {
        console.error("준비사항 요청 실패");
      }
    } catch (error) {
      console.error("준비사항 요청 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 직무와 년차로 검색 페이지로 이동
  const handleSearch = () => {
    if (!selectedPosition && !selectedExperience) {
      router.push("/search");
      return;
    }

    const searchParams = new URLSearchParams();
    if (selectedPosition) searchParams.append("position", selectedPosition);
    if (selectedExperience)
      searchParams.append("experience", selectedExperience);

    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">잡정리</h1>
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          <span className="font-semibold text-blue-700">
            직무와 년차에 맞는 기술 스택과 준비사항
          </span>
          을 한눈에 확인하세요.
          <br />
          <span className="text-gray-500">
            이 서비스는{" "}
            <span className="font-medium text-green-700">
              직접 입력한 채용공고
            </span>
            를 분석하여
            <br />
            필요한 기술 스택과 준비 방법을{" "}
            <span className="font-medium text-purple-700">
              AI가 제공합니다.
            </span>
          </span>
          <br />
          <span className="block mt-2 text-sm text-gray-400">
            ※ 별도의 채용공고 데이터는 없으며, 사용자들이 입력한 채용공고를
            바탕으로 분석합니다.
          </span>
        </p>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="position"
                className="block text-lg font-medium mb-2"
              >
                직무 선택
              </label>
              <select
                id="position"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">직무를 선택하세요</option>
                {positions.map((position, index) => (
                  <option key={index} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="experience"
                className="block text-lg font-medium mb-2"
              >
                년차 선택
              </label>
              <select
                id="experience"
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">년차를 선택하세요</option>
                <option value="신입">신입</option>
                <option value="1~3년">1~3년</option>
                <option value="3~5년">3~5년</option>
                <option value="5~7년">5~7년</option>
                <option value="7~10년">7~10년</option>
                <option value="10년 이상">10년 이상</option>
                <option value="경력 무관">경력 무관</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePrepareSkills}
              disabled={isLoading || !selectedPosition || !selectedExperience}
              className={`px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition ${
                isLoading || !selectedPosition || !selectedExperience
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? "불러오는 중..." : "준비사항 보기"}
            </button>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
            >
              채용공고 검색하기
            </button>
          </div>
        </div>
      </section>

      {skillsData && (
        <section className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {selectedPosition} ({selectedExperience}) 준비사항
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-700">
                필수 기술 스택
              </h3>
              <div className="space-y-3">
                {skillsData.essentialSkills.map(
                  (skill: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>{skill}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-700">
                우대 기술 및 역량
              </h3>
              <div className="space-y-3">
                {skillsData.bonusSkills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">
              준비 방법 및 추천 자료
            </h3>
            <div className="bg-purple-50 p-4 rounded-md">
              {skillsData.recommendations.map(
                (recommendation: string, index: number) => (
                  <p key={index} className="mb-2">
                    {recommendation}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`/search?position=${encodeURIComponent(
                selectedPosition
              )}&experience=${encodeURIComponent(selectedExperience)}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
            >
              관련 채용공고 보기
            </Link>
          </div>
        </section>
      )}

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          잡정리 서비스 사용법
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-3">1</div>
            <h3 className="text-lg font-semibold mb-2">직무와 년차 선택</h3>
            <p className="text-gray-600">
              관심 있는 직무와 본인의 년차를 선택해 주세요.
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-3">2</div>
            <h3 className="text-lg font-semibold mb-2">준비사항 확인</h3>
            <p className="text-gray-600">
              AI가 분석한 필요 기술스택과 준비방법을 확인하세요.
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-3">3</div>
            <h3 className="text-lg font-semibold mb-2">채용공고 검색</h3>
            <p className="text-gray-600">
              관련 채용공고를 검색하고 지원 준비를 시작하세요.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
