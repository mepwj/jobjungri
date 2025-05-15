import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "잡정리 - 채용공고 정보 한번에",
  description: "직무와 년차별 기술스택 및 채용공고 정보를 한눈에 확인하세요.",
  keywords: ["잡정리", "채용공고", "기술스택", "직무", "개발자"],
  authors: [{ name: "잡정리 팀" }],
  creator: "잡정리",
  publisher: "잡정리",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header className="bg-blue-600 text-white shadow-md">
          <div className="max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">잡정리</Link>
              <nav className="space-x-6">
                <Link 
                  href="/search" 
                  className="hover:underline"
                >
                  직무/년차별 검색
                </Link>
                <Link 
                  href="/job-posting" 
                  className="hover:underline"
                >
                  채용공고 입력
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-6">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} 잡정리. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
