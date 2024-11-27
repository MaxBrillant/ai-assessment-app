import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Quizdom AI - Create insightful and well-crafted assessment questions from any PDF, Word • Docs or PowerPoint document",
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
    "document-based quiz generator",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
