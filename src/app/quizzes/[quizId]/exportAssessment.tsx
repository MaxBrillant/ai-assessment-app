"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { exportPdf } from "@/utils/exportPdf";
import { useState } from "react";
import { calculateTotalMarks } from "@/utils/calculateTotalMarks";
import ReactDOMServer from "react-dom/server";
import { exportDocx } from "@/utils/exportDocx";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
import { TbFileExport } from "react-icons/tb";
import SafeHTMLRenderer from "@/utils/htmlRenderer";
import { QuestionType } from "@/app/components/question";
import DOMPurify from "dompurify";

export default function ExportAssessment(props: {
  fileName: string;
  questions: QuestionType[];
}) {
  const [selectedContent, setSelectedContent] = useState<
    "questions" | "questions-and-answers"
  >("questions-and-answers");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-1 items-center">
          <TbFileExport className="w-5 h-5" />
          Export as
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <div className="flex flex-col gap-4">
          <p className="text-xl">Export options</p>
          <ul className="flex flex-col gap-2">
            <li className="flex gap-2">
              <input
                id="questions"
                type="radio"
                checked={selectedContent === "questions"}
                onChange={() => setSelectedContent("questions")}
              />
              <label htmlFor="questions">Questions only</label>
            </li>
            <li className="flex gap-2">
              <input
                id="questions-and-answers"
                type="radio"
                checked={selectedContent === "questions-and-answers"}
                onChange={() => setSelectedContent("questions-and-answers")}
              />
              <label htmlFor="questions-and-answers">
                Questions and answers
              </label>
            </li>
          </ul>

          <div className="w-full flex gap-1 items-end justify-end">
            <Button
              className="bg-blue-500 hover:bg-blue-700 gap-1"
              onClick={async () => {
                const content = getExportContent(
                  props.fileName,
                  props.questions,
                  selectedContent
                );

                const htmlString = ReactDOMServer.renderToStaticMarkup(content);
                console.log(htmlString);
                exportDocx(htmlString, props.fileName);
              }}
            >
              <FaRegFileWord className="w-4 h-4 white" /> Save as DOCX
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-700 gap-1"
              onClick={() => {
                const content = getExportContent(
                  props.fileName,
                  props.questions,
                  selectedContent
                );

                const htmlString = ReactDOMServer.renderToStaticMarkup(content);
                console.log(htmlString);
                exportPdf(htmlString, props.fileName);
              }}
            >
              <FaRegFilePdf className="w-4 h-4 white" /> Save as PDF
            </Button>
          </div>
        </div>

        <div className="w-full flex-grow overflow-auto text-sm flex p-4 rounded-md bg-black/5 -mt-2 text-black/70">
          {getExportContent(props.fileName, props.questions, selectedContent)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getExportContent = (
  fileName: string,
  questions: QuestionType[],
  selectedContent: "questions" | "questions-and-answers"
) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">{fileName}</h1>
        <p>
          {calculateTotalMarks(questions.map((question) => question.marks))}{" "}
          {calculateTotalMarks(questions.map((question) => question.marks)) ===
          1
            ? "Mark"
            : "Marks"}
        </p>
        <hr className="mt-5 border-black/70" />
      </div>
      {
        <div className="flex flex-col gap-4">
          {questions.map((question, index) => {
            return (
              <li className="list-none flex flex-col gap-2" key={index}>
                <h6 className="text-md font-medium">
                  <span>Question {index + 1}.</span>
                  <SafeHTMLRenderer htmlContent={question.content} />
                </h6>

                {question.type === "multiple-choice" && (
                  <ul>
                    {question.choices?.map((choice, index) => (
                      <li
                        key={index}
                        className="list-none"
                        style={{ marginBottom: "3", marginTop: "3" }}
                      >
                        {String.fromCharCode(index + 65)}. {choice}
                      </li>
                    ))}
                  </ul>
                )}
                {question.marks && (
                  <p>
                    {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
                  </p>
                )}

                <div className="flex flex-col gap-1">
                  {selectedContent === "questions-and-answers" && (
                    <p style={{ textDecoration: "underline" }}>
                      {question.type === "multiple-choice"
                        ? "Correct choices:"
                        : "Correct answer:"}
                    </p>
                  )}
                  {selectedContent === "questions-and-answers" &&
                    question.type === "multiple-choice" && (
                      <ul className="list-none" style={{ marginBottom: "6" }}>
                        {question.answer.choices?.map((choice) => (
                          <li className="list-none" key={choice}>
                            {String.fromCharCode(
                              (question.choices?.findIndex(
                                (c) => c === choice
                              ) as number) + 65
                            )}
                            . {choice}
                          </li>
                        ))}
                      </ul>
                    )}

                  {selectedContent === "questions-and-answers" &&
                    question.type !== "multiple-choice" && (
                      <SafeHTMLRenderer
                        htmlContent={question.answer.content as string}
                      />
                    )}
                </div>
                <hr className="my-2 border-black/70" />
              </li>
            );
          })}
        </div>
      }
    </div>
  );
};

export const getQuestionExportContent = (question: QuestionType) => {
  const questionContent = question.content
    ? DOMPurify.sanitize(question.content, { ALLOWED_TAGS: [] })
    : "";

  const questionChoices = question.choices
    ? question.choices
        .map((choice, index) => `${String.fromCharCode(index + 65)}. ${choice}`)
        .join("\n")
    : "";
  const questionAnswer = question.answer.choices
    ? question.answer.choices
        .map(
          (choice) =>
            `Correct choices:\n${String.fromCharCode(
              (question.choices?.findIndex((c) => c === choice) as number) + 65
            )}. ${choice}`
        )
        .join("\n")
    : `Correct answer:\n${DOMPurify.sanitize(
        question.answer.content as string,
        {
          ALLOWED_TAGS: [],
        }
      )}`;

  return (
    `${questionContent}\n${question.marks} marks\n` +
    (question.type === "multiple-choice" ? questionChoices : "") +
    "\n" +
    questionAnswer
  );
};
