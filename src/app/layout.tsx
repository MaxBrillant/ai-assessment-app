import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizdom AI - Fast, Reliable Assessments for the Age of AI",
  description:
    "Easily Create, Customize, and Grade High-Quality Assessments, Quizzes and Tests with AI-Powered Precision",
  keywords: [
    "assessment creation",
    "AI-powered assessment creation",
    "free",
    "assessment",
    "quiz",
    "free AI quiz generator",
    "AI for education",
    "online quiz maker",
    "AI assessment tools",
    "digital quiz generator",
    "question generator AI",
    "assessment automation",
    "AI tools for educators",
    "AI education software",
    "automated grading system",
    "AI for teachers",
    "AI test creation",
    "customizable quizzes",
    "interactive quiz platform",
    "editable assessments",
    "test generator with AI",
    "exportable quizzes",
    "time-saving assessment tool",
    "efficient grading solutions",
    "smart test creator",
    "innovative quiz tools",
    "AI-based learning tools",
    "interview assessment tool",
    "trainer tools with AI",
    "educational content creator",
    "PDF to quiz converter",
    "Microsoft Word to quiz converter",
    "Powerpoint to quiz converter",
    "document-based quiz generator",
  ],
  openGraph: {
    type: "website",
    url: "https://getquizdom.com",
    title: "Quizdom AI - Fast, Reliable Assessments for the Age of AI",
    description:
      "Easily Create, Customize, and Grade High-Quality Assessments, Quizzes and Tests with AI-Powered Precision",
    images: [
      {
        url: "https://www.getquizdom.com/logo-icon.svg",
        width: 100,
        height: 100,
        alt: "Quizdom logo",
      },
      {
        url: "https://www.getquizdom.com/logo.svg",
        width: 400,
        height: 100,
        alt: "Quizdom logo",
      },
      {
        url: "https://www.getquizdom.com/certification.webp",
        width: 1280,
        height: 853,
        alt: "Certification",
      },
      {
        url: "https://www.getquizdom.com/corporate.webp",
        width: 1280,
        height: 853,
        alt: "Corporate",
      },
      {
        url: "https://www.getquizdom.com/recruiter.webp",
        width: 1280,
        height: 853,
        alt: "Recruiter",
      },
      {
        url: "https://www.getquizdom.com/teacher.webp",
        width: 1280,
        height: 853,
        alt: "Teacher",
      },
      {
        url: "https://www.getquizdom.com/feature1.webp",
        width: 1280,
        height: 1280,
        alt: "Feature 1",
      },
      {
        url: "https://www.getquizdom.com/feature2.webp",
        width: 1280,
        height: 1280,
        alt: "Feature 2",
      },
      {
        url: "https://www.getquizdom.com/feature3.webp",
        width: 1280,
        height: 1280,
        alt: "Feature 3",
      },
      {
        url: "https://www.getquizdom.com/feature4.webp",
        width: 1280,
        height: 1280,
        alt: "Feature 4",
      },
      {
        url: "https://www.getquizdom.com/feature5.webp",
        width: 1280,
        height: 1280,
        alt: "Feature 5",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-background"}>
        {children} <Toaster /> <Analytics />
      </body>
    </html>
  );
}
