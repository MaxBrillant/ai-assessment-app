"use client";

import { z } from "zod";
import { generationSchema } from "../validation/generationValidation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";

type SchemaType = z.infer<typeof generationSchema>;
export default function GenerationForm(props: {
  uploadedDocument: File;
  onSubmit: (data: SchemaType) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SchemaType>({
    resolver: zodResolver(generationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      difficultyLevel: 50,
      requirements: undefined,
    },
  });

  const onSubmit = (data: SchemaType) =>
    startTransition(async () => {
      props.onSubmit(data);
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full grid grid-cols-2 gap-10 gap-x-7 p-2 py-5"
    >
      <div>
        <label
          htmlFor="questions"
          className="text-xs font-medium text-black/70"
        >
          Number of questions
        </label>
        <Input
          {...register("numberOfQuestions", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          id="questions"
          type="number"
          min={1}
          max={20}
          placeholder="5"
          autoFocus
        />
        {errors.numberOfQuestions && (
          <p className="text-red-500 text-sm">
            {errors.numberOfQuestions.message}
          </p>
        )}
      </div>
      <div className="items-end">
        <label htmlFor="marks" className="text-xs font-medium text-black/70">
          Total points
        </label>
        <Input
          {...register("totalMarks", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          id="marks"
          type="number"
          min={5}
          max={200}
          placeholder="20"
        />

        {errors.totalMarks && (
          <p className="text-red-500 text-sm">{errors.totalMarks.message}</p>
        )}
      </div>
      <div className="col-span-2">
        <p className="text-sm font-medium text-black/70">
          How difficult should the questions be?
        </p>
        <div className="p-2 space-y-1 mt-2">
          <Slider
            defaultValue={[watch("difficultyLevel")]}
            max={100}
            step={25}
            onValueChange={(value) => setValue("difficultyLevel", value[0])}
          />
          <div className="w-full flex flex-row gap-1 justify-between">
            <p className="text-xs">Very Easy</p>
            <p className="text-xs">Very Hard</p>
          </div>
        </div>

        {errors.difficultyLevel && (
          <p className="text-red-500 text-sm">
            {errors.difficultyLevel.message}
          </p>
        )}
      </div>

      <div className="col-span-2">
        <label
          htmlFor="requirements"
          className="text-sm font-medium text-black/70"
        >
          Requirements or instructions (optional)
        </label>
        <Textarea
          {...register("requirements", {
            setValueAs: (value) => (value === "" ? undefined : value),
          })}
          id="requirements"
          placeholder="Generate fun and engaging questions"
        />
        {errors.requirements && (
          <p className="text-red-500 text-sm">{errors.requirements.message}</p>
        )}
      </div>
      <Button type="submit" className="col-span-2" disabled={isPending}>
        Finish
      </Button>
    </form>
  );
}
