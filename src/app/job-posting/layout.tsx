import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "채용공고 입력 - 잡정리",
  description: "채용공고 텍스트를 입력하여 구조화된 정보로 변환해 보세요.",
  keywords: ["잡정리", "채용공고", "기술스택", "분석"],
};

export default function JobPostingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
