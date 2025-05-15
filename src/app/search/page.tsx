"use client";

import { useState, useEffect } from "react";
import { Metadata } from "next";

// 메타데이터는 서버 컴포넌트에서만 동작하므로 별도의 파일로 분리하거나 layout.tsx에서 정의해야 합니다.
// export const metadata: Metadata = {
//   title: "직무/년차별 검색 - 잡정리",
//   description: "직무와 년차에 따른 기술스택 및 요구사항을 한 눈에 확인하세요.",
// };

interface JobPosting {
  id: string;
  company: string;
  position: string;
  experience: string;
  techStack: string[];
  preferredSkills: string[];
}

export default function SearchPage() {
  const [positions, setPositions] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  
  // URL 파라미터에서 직무/년차 정보 가져오기 및 자동 검색
  useEffect(() => {
    // 브라우저 환경에서만 실행 (Next.js의 SSR 대응)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const positionParam = url.searchParams.get("position");
      const experienceParam = url.searchParams.get("experience");
      
      if (positionParam) setSelectedPosition(positionParam);
      if (experienceParam) setExperienceLevel(experienceParam);
      
      // 파라미터가 있으면 자동 검색 실행
      if (positionParam || experienceParam) {
        // positions 로딩 후 검색 실행을 위해 약간 늦게 실행
        setTimeout(() => {
          handleSearch();
        }, 500);
      }
    }
  }, []);

  // 검색 처리
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = "/api/job-posting";
      const params = new URLSearchParams();
      
      if (selectedPosition) params.append("position", selectedPosition);
      if (experienceLevel) params.append("experience", experienceLevel);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("검색 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setJobPostings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setJobPostings([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 삭제 처리
  const handleDelete = async (id: string) => {
    // 먼저 확인 대화상자 표시
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/job-posting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '삭제 중 오류가 발생했습니다.');
      }

      // 성공적으로 삭제한 후 리스트에서 제거
      setJobPostings(jobPostings.filter(posting => posting.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // 삭제 취소
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">직무/년차별 검색</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor="position" 
              className="block text-lg font-medium mb-2"
            >
              직무
            </label>
            <select
              id="position"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 직무</option>
              {positions.map((position, index) => (
                <option key={index} value={position}>{position}</option>
              ))}
            </select>
          </div>

          <div>
            <label 
              htmlFor="experience" 
              className="block text-lg font-medium mb-2"
            >
              년차
            </label>
              <select
              id="experience"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 년차</option>
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

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "검색 중..." : "검색하기"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {jobPostings.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">검색 결과 ({jobPostings.length})</h2>
          
          {jobPostings.map((posting) => (
            <div key={posting.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <h3 className="text-xl font-bold">{posting.company}</h3>
                <div className="flex space-x-4 mt-2 md:mt-0">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {posting.position}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {posting.experience}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">기술 스택:</h4>
                <div className="flex flex-wrap gap-2">
                  {posting.techStack.map((tech, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">우대 사항:</h4>
                <ul className="list-disc pl-5">
                  {posting.preferredSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex justify-end">
                {deleteConfirm === posting.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(posting.id)}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      {isDeleting ? "삭제 중..." : "확인"}
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(posting.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && !error ? (
        <div className="text-center py-10 text-gray-500">
          <p>검색 결과가 없습니다. 다른 조건으로 검색해보세요.</p>
        </div>
      ) : null}
    </div>
  );
}
