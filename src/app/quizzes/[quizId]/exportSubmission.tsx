"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { exportPdf } from "@/utils/exportPdf";
import { calculateTotalMarks } from "@/utils/calculateTotalMarks";
import ReactDOMServer from "react-dom/server";
import { exportDocx } from "@/utils/exportDocx";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
import { answersType } from "@/app/validation/submissionValidation";
import { QuestionType } from "@/app/components/question";
import SafeHTMLRenderer from "@/utils/htmlRenderer";

export default function ExportSubmission(props: {
  fileName: string;
  questions: QuestionType[];
  answers: answersType;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Export submission</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <div className="flex flex-col gap-4">
          <p className="text-xl">Export options</p>

          <div className="w-full flex gap-4 items-end justify-end">
            <Button
              className="bg-blue-500 hover:bg-blue-700 gap-1"
              onClick={async () => {
                const content = getExportContent(
                  props.fileName,
                  props.questions,
                  props.answers
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
                  props.answers
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
          {getExportContent(props.fileName, props.questions, props.answers)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const getExportContent = (
  fileName: string,
  questions: QuestionType[],
  answers: answersType
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

                <div className="flex flex-col gap-1">
                  <p style={{ textDecoration: "underline" }}>
                    {question.type === "multiple-choice"
                      ? "Submitted choices:"
                      : "Submitted answer:"}
                  </p>

                  {question.type === "multiple-choice" && (
                    <ul className="list-none" style={{ marginBottom: "6" }}>
                      {answers.find(
                        (answer) => answer.questionId === question.id
                      ) &&
                      (answers.find(
                        (answer) => answer.questionId === question.id
                      )?.choices?.length as number) > 0 ? (
                        answers
                          .find((answer) => answer.questionId === question.id)
                          ?.choices?.map((choice) => (
                            <li className="list-none" key={choice}>
                              {String.fromCharCode(
                                (question.choices?.findIndex(
                                  (c) => c === choice
                                ) as number) + 65
                              )}
                              . {choice}
                            </li>
                          ))
                      ) : (
                        <p>No choices have been submitted</p>
                      )}
                    </ul>
                  )}

                  {question.type !== "multiple-choice" &&
                    (answers.find(
                      (answer) => answer.questionId === question.id
                    ) &&
                    answers.find((answer) => answer.questionId === question.id)
                      ?.content ? (
                      <p>
                        {
                          answers.find(
                            (answer) => answer.questionId === question.id
                          )?.content
                        }
                      </p>
                    ) : (
                      <p>No answer has been submitted for this question</p>
                    ))}

                  {answers.find((answer) => answer.questionId === question.id)
                    ?.marks && (
                    <div>
                      <p style={{ textDecoration: "underline" }}>
                        Received marks:
                      </p>
                      <h6 className="text-md font-medium">
                        {
                          answers.find(
                            (answer) => answer.questionId === question.id
                          )?.marks
                        }
                        {" out of " + question.marks}
                      </h6>
                    </div>
                  )}

                  {answers.find((answer) => answer.questionId === question.id)
                    ?.comment && (
                    <p style={{ textDecoration: "underline" }}>
                      Received comment:
                    </p>
                  )}
                  {answers.find((answer) => answer.questionId === question.id)
                    ?.comment && (
                    <p>
                      {
                        answers.find(
                          (answer) => answer.questionId === question.id
                        )?.comment
                      }
                    </p>
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
