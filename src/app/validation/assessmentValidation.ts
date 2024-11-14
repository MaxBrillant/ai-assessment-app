import { z } from "zod";
import { questionSchema } from "./questionValidation";

export const assessmentSchema = z.object({
  title: z
    .string()
    .min(1, "The title cannot be empty")
    .max(70, "The title cannot be more than 70 characters"),
  questions: z
    .array(questionSchema)
    .max(40, "The questions array cannot be more than 40 questions"),
  duration: z.enum(["15", "30", "45", "60", "90", "120", "150", "180"]),
  instructions: z
    .string()
    .max(5000, "The instructions cannot be more than 5000 characters")
    .optional(),
  credentials: z
    .array(
      z
        .string()
        .min(1, "The credential title cannot be empty")
        .max(100, "The credential title cannot be more than 100 characters")
    )
    .max(3, "There cannot be more than 3 credentials"),
  difficultyLevel: z
    .number()
    .min(0, "The difficulty level cannot be less than 0")
    .max(100, "The difficulty level cannot be more than 100"),
  generationRequirements: z
    .string()
    .max(5000, "The requirements cannot be more than 5000 characters")
    .optional(),
});
