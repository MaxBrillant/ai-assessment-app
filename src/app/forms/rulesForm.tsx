"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdDeleteOutline } from "react-icons/md";
import { z } from "zod";
import { assessmentSchema } from "../validation/assessmentValidation";

const rulesSchema = assessmentSchema.pick({
  title: true,
  duration: true,
  instructions: true,
  credentials: true,
});
type RulesSchemaType = z.infer<typeof rulesSchema>;
type propsType = {
  defaultValues: RulesSchemaType;
  mode: "create" | "update";
  onSubmit: (data: RulesSchemaType) => void;
};
export default function RulesForm(props: propsType) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RulesSchemaType>({
    resolver: zodResolver(rulesSchema),
    defaultValues: {
      title: props.defaultValues.title,
      instructions: props.defaultValues.instructions,
      duration: props.defaultValues.duration,
      credentials: props.defaultValues.credentials,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const errorMessages = Object.values(errors).flatMap((error: any) => {
    if (Array.isArray(error)) {
      const arrayErrors = error.map((arrayError: any) => arrayError.message);
      return arrayErrors;
    } else {
      return [error.message];
    }
  });

  const onSubmit = (data: RulesSchemaType) => {
    props.onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-2xl font-semibold">Assessment Rules</p>
      <div className="flex flex-col">
        <label htmlFor="title">Title</label>
        <Input
          {...register("title")}
          defaultValue={watch("title")}
          id="title"
          placeholder="Write the title here"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="duration">Duration of the assessment</label>
        <select
          className="w-fit"
          id="duration"
          defaultValue={watch("duration")}
          {...register("duration")}
        >
          <option value={"15"}>15 Minutes</option>
          <option value={"30"}>30 Minutes</option>
          <option value={"45"}>45 Minutes</option>
          <option value={"60"}>1 Hour</option>
          <option value={"90"}>1 Hour 30 Minutes</option>
          <option value={"120"}>2 Hours</option>
          <option value={"150"}>2 Hours 30 Minutes</option>
          <option value={"180"}>3 Hours</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="instructions">Instructions</label>
        <Textarea
          {...register("instructions", {
            setValueAs: (value) => (value === "" ? undefined : value),
          })}
          id="instructions"
          defaultValue={watch("instructions")}
          placeholder="Write instructions here"
        />
      </div>
      <div className="flex flex-col gap-1">
        <p>Credentials</p>
        {props.mode === "update" && (
          <p>
            You cannot edit or delete credentials once the assessment is created
          </p>
        )}
        {watch("credentials")?.map((credential, index) => {
          return (
            <div className="flex flex-row justify-between" key={index}>
              <Input
                value={credential}
                autoFocus={credential === ""}
                placeholder="Enter a credential"
                disabled={props.mode === "update"}
                onChange={(e) =>
                  setValue(
                    "credentials",
                    watch("credentials")?.map((c, i) =>
                      i === index ? e.target.value : c
                    )
                  )
                }
              />
              {props.mode === "create" && (
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="aspect-square"
                  onClick={() =>
                    setValue(
                      "credentials",
                      watch("credentials")?.filter((_, i) => i !== index)
                    )
                  }
                >
                  <MdDeleteOutline className="w-6 h-6" />
                </Button>
              )}
            </div>
          );
        })}
        {props.mode === "create" && (
          <Button
            variant={"outline"}
            onClick={() =>
              setValue("credentials", [...watch("credentials"), ""])
            }
          >
            Add a credential
          </Button>
        )}
      </div>

      {errorMessages.length > 0 && (
        <div className="p-3 bg-red-100/80 rounded-2xl">
          {errorMessages.map((error) => (
            <p className="text-red-500 ">{error}</p>
          ))}
        </div>
      )}
      <Button type="submit">
        {props.mode === "create" ? "Publish" : "Update"}
      </Button>
    </form>
  );
}
