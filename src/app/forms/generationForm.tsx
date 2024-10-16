"use client";

import { z } from "zod";
import { generationSchema } from "../validation/generationValidation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaFilePdf, FaFilePowerpoint, FaFileWord } from "react-icons/fa6";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

type SchemaType = z.infer<typeof generationSchema>;
export default function GenerationForm(props: {
  uploadedDocument: File;
  onSubmit: (data: SchemaType) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SchemaType>({
    resolver: zodResolver(generationSchema),
    reValidateMode: "onChange",
    defaultValues: {
      difficultyLevel: 40,
      startingFrom: undefined,
      endingAt: undefined,
      requirements: "",
    },
  });

  const onSubmit = (data: SchemaType) => {
    props.onSubmit(data);
  };
  const errorMessages = Object.values(errors).flatMap((error: any) => {
    return [error.message];
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2 items-center mx-auto text-center w-fit max-w-sm p-5 bg-slate-300 rounded-2xl">
        {props.uploadedDocument.type === "application/pdf" ? (
          <FaFilePdf className="w-16 h-16 fill-red-700" />
        ) : props.uploadedDocument.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
          <FaFileWord className="w-16 h-16 fill-blue-700" />
        ) : (
          <FaFilePowerpoint className="w-16 h-16 fill-orange-700" />
        )}
        <p className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
          {props.uploadedDocument.name}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-5 py-3">
        <div>
          <label htmlFor="questions">How many questions?</label>
          <Input
            {...register("numberOfQuestions", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            id="questions"
            type="number"
            min={1}
            max={20}
            placeholder="5"
          />
        </div>
        <div>
          <label htmlFor="marks">How many marks?</label>
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
        </div>
        <div className="col-span-2">
          <p>What is the level of difficulty?</p>
          <div className="w-full flex flex-row gap-2 justify-between">
            <p>Very Easy</p>
            <p>Very Hard</p>
          </div>
          <Slider
            defaultValue={[watch("difficultyLevel")]}
            max={100}
            step={20}
            onValueChange={(value) => setValue("difficultyLevel", value[0])}
          />
        </div>
        <Accordion type="single" collapsible className="w-full col-span-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>Advanced Options</AccordionTrigger>
            <AccordionContent className="grid grid-cols-2 gap-5 py-3">
              <div>
                <label htmlFor="start">Starting Page</label>
                <Input
                  {...register("startingFrom", {
                    setValueAs: (value) =>
                      value === "" ? undefined : Number(value),
                  })}
                  id="start"
                  type="number"
                  min={1}
                  max={Math.ceil(props.uploadedDocument?.size / 10000)}
                  placeholder="100"
                />
              </div>
              <div>
                <label htmlFor="end">Last Page</label>
                <Input
                  type="number"
                  {...register("endingAt", {
                    setValueAs: (value) =>
                      value === "" ? undefined : Number(value),
                  })}
                  id="end"
                  min={2}
                  max={100}
                  placeholder={props.uploadedDocument.size.toString()}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="requirements">Any special requirements?</label>
                <Textarea
                  {...register("requirements", {
                    setValueAs: (value) => (value === "" ? undefined : value),
                  })}
                  id="requirements"
                  placeholder="Write any special requirements here"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {errorMessages.length > 0 && (
        <div className="p-3 bg-red-100/80 rounded-2xl">
          {errorMessages.map((error) => (
            <p className="text-red-500 ">{error}</p>
          ))}
        </div>
      )}
      <Button className="w-full" type="submit">
        Generate
      </Button>
    </form>
  );
}
