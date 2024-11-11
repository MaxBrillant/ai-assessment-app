"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { assessmentSchema } from "../validation/assessmentValidation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdClose } from "react-icons/io";
import { FiPlus } from "react-icons/fi";

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 p-5 max-w-md"
    >
      <div className="flex flex-col">
        <label htmlFor="title" className="font-medium">
          Title
        </label>
        <Input
          {...register("title")}
          defaultValue={watch("title")}
          id="title"
          placeholder="Write the title here"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="duration" className="font-medium">
          Duration of the assessment
        </label>

        <Select
          onValueChange={(value) =>
            setValue(
              "duration",
              value as "15" | "30" | "45" | "60" | "90" | "120" | "150" | "180"
            )
          }
          value={watch("duration")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"15"}>15 Minutes</SelectItem>
            <SelectItem value={"30"}>30 Minutes</SelectItem>
            <SelectItem value={"45"}>45 Minutes</SelectItem>
            <SelectItem value={"60"}>1 Hour</SelectItem>
            <SelectItem value={"90"}>1 Hour 30 Minutes</SelectItem>
            <SelectItem value={"120"}>2 Hours</SelectItem>
            <SelectItem value={"150"}>2 Hours 30 Minutes</SelectItem>
            <SelectItem value={"180"}>3 Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="instructions" className="font-medium">
          Instructions
        </label>
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
        <p className="font-medium">Credentials</p>
        {props.mode === "update" ? (
          <p className="text-xs text-black/70">
            You cannot edit or delete credentials once the assessment is created
          </p>
        ) : (
          <p className="text-xs text-black/70">
            Define the information you need from participants before they begin
            the assessment. These details will be requested at the start of each
            submission. Credentials can only be set up once.
          </p>
        )}
        <div className="flex flex-col gap-2 my-2">
          {watch("credentials")?.map((credential, index) => {
            return (
              <div
                className="flex flex-row justify-between items-center gap-2"
                key={index}
              >
                {index === 0 && <p className="text-xs font-medium">Unique</p>}
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
                    onClick={(e) => {
                      e.preventDefault();
                      setValue(
                        "credentials",
                        watch("credentials")?.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <IoMdClose className="w-5 h-5 fill-black/50 hover:fill-red-500" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        {props.mode === "create" && (
          <button
            className="w-full flex flex-row px-2 py-1 items-center text-center text-sm gap-1 rounded-full opacity-70 hover:opacity-100 focus:opacity-100 hover:bg-black/5 focus:bg-black/5"
            onClick={(e) => {
              e.preventDefault();
              setValue("credentials", [...watch("credentials"), ""]);
            }}
          >
            <span>
              <FiPlus className="w-5 h-5" />
            </span>
            Add a credential
          </button>
        )}
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
      <Button
        type="submit"
        disabled={
          errorMessages.length > 0 ||
          (props.mode === "update" &&
            props.defaultValues.title === watch("title") &&
            props.defaultValues.instructions === watch("instructions") &&
            props.defaultValues.duration === watch("duration"))
        }
      >
        {props.mode === "create" ? "Publish" : "Update"}
      </Button>
    </form>
  );
}
