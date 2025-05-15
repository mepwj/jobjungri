"use client";

import { useState } from "react";

export default function JobPostingPage() {
  const [jobPostingText, setJobPostingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jobPostingText.trim()) {
      setError("채용공고 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/job-posting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingText }),
      });

      if (!response.ok) {
        throw new Error("채용공고 분석에 실패했습니다.");
      }

      const data = await response.json();
      setAnalysisResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">채용공고 입력</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="jobPostingText" 
            className="block text-lg font-medium mb-2"
          >
            채용공고 텍스트
          </label>
          <textarea
            id="jobPostingText"
            value={jobPostingText}
            onChange={(e) => setJobPostingText(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="채용공고 전체 내용을 여기에 붙여넣기 하세요..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "분석 중..." : "채용공고 분석하기"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">분석 결과</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">회사명</h3>
                <p className="text-gray-800">{analysisResult.company}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">직무</h3>
                <p className="text-gray-800">{analysisResult.position}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">년차</h3>
                <p className="text-gray-800">{analysisResult.experience}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">기술 스택</h3>
              {analysisResult.techStack && analysisResult.techStack.length > 0 ? (
                <ul className="list-disc pl-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {analysisResult.techStack.map((tech: string, index: number) => (
                    <li key={index} className="text-gray-800">{tech}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">기술 스택 정보가 없습니다.</p>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">우대 사항</h3>
              {analysisResult.preferredSkills && analysisResult.preferredSkills.length > 0 ? (
                <ul className="list-disc pl-5">
                  {analysisResult.preferredSkills.map((skill: string, index: number) => (
                    <li key={index} className="text-gray-800">{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">우대 사항 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
