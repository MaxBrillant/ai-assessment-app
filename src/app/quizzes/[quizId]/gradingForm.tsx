"use client";

import { QuestionListType } from "@/app/components/questionsPanel";
import {
  answersType,
  gradeSchema,
} from "@/app/validation/submissionValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type GradeSchemaType = z.infer<typeof gradeSchema>;
export default function GradingForm(props: {
  question: QuestionListType[0];
  answer: answersType[0] | undefined;
  onSubmit: (data: GradeSchemaType) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
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
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm flex flex-col gap-3"
    >
      <div>
        <label htmlFor="marks" className="text-sm">
          Marks
        </label>
        <div className="flex gap-2 items-center">
          <Input
            {...register("marks", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            id="marks"
            type="number"
            autoFocus
            max={props.question.marks}
            className="w-20"
          />
          <p className="text-sm">out of {props.question.marks}</p>
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="text-sm">
          Comment
        </label>
        <Textarea
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
            <p className="text-red-500 " key={error}>
              {error}
            </p>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
