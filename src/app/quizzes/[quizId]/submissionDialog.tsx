"use client";

import { QuestionListType } from "@/app/components/questionsPanel";
import {
  answersType,
  gradeSchema,
} from "@/app/validation/submissionValidation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type GradeSchemaType = z.infer<typeof gradeSchema>;
export default function SubmissionDialog(props: {
  children: any;
  question: QuestionListType[0];
  answer: answersType[0] | undefined;
  onSubmit: (data: GradeSchemaType) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GradeSchemaType>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      marks: props.answer ? props.answer.marks : undefined,
      comment: props.answer ? props.answer.comment : undefined,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [open, setOpen] = useState(false);

  const errorMessages = Object.values(errors).flatMap((error: any) => {
    if (Array.isArray(error)) {
      const arrayErrors = error.map((arrayError: any) => arrayError.message);
      return arrayErrors;
    } else {
      return [error.message];
    }
  });

  const onSubmit = (data: GradeSchemaType) => {
    props.onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <p className="text-2xl font-medium">Grade this answer</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="marks">Marks</label>
            <Input
              {...register("marks", {
                setValueAs: (value) =>
                  value === "" ? undefined : Number(value),
              })}
              id="marks"
              type="number"
              max={props.question.marks}
              placeholder="Enter marks here"
            />
          </div>
          <div>
            <label htmlFor="comment">Comment</label>
            <Input
              {...register("comment", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
              id="comment"
              placeholder="Write a comment here"
            />
          </div>

          {errorMessages.length > 0 && (
            <div className="p-3 bg-red-100/80 rounded-2xl">
              {errorMessages.map((error) => (
                <p className="text-red-500 ">{error}</p>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit">Submit Grade</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
