import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "급여명세서 발송 시스템",
  description: "사원별 급여명세서 이메일 자동 발송 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
